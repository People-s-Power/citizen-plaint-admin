import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useAtom } from "jotai";
import { adminAtom } from "@/atoms/adminAtom";
import Reviews from "./modals/Reviews";
import TaskViewModal from "./modals/TaskViewModal";
import { SERVER_URL } from "@/pages/_app";
import NewTask from "./CreateTask";
import { checkAccess } from "@/utils/accessUtils";
import { accessAtom } from "@/atoms/adminAtom";
import {
  Panel,
  Toolbar,
  SearchInput,
  Select,
  Button,
  RowAction,
  Table,
  THead,
  TBody,
  Th,
  Tr,
  Td,
  CellStack,
  StatusPill,
  Tag,
  Empty,
  TableSkeleton,
  EmptyState,
  TableFooter,
} from "@/components/ui/admin-kit";

const STATUS_META = {
  COMPLETE: { label: "Complete", tone: "success" },
  DONE: { label: "Done", tone: "success" },
  UNDER_REVIEW: { label: "Under review", tone: "info" },
  ONGOING: { label: "Ongoing", tone: "warning" },
  OVERDUE: { label: "Overdue", tone: "danger" },
  ABANDONED: { label: "Abandoned", tone: "neutral" },
};

const ALL_STATUS_OPTIONS = [
  { label: "Complete", value: "COMPLETE" },
  { label: "Done", value: "DONE" },
  { label: "Overdue", value: "OVERDUE" },
  { label: "Under Review", value: "UNDER_REVIEW" },
  { label: "Ongoing", value: "ONGOING" },
  { label: "Abandoned", value: "ABANDONED" },
];

/** Non-admins may only move a task between these two states. */
const USER_STATUS_OPTIONS = [
  { label: "Done", value: "DONE" },
  { label: "Ongoing", value: "ONGOING" },
];

const SETTLED = ["COMPLETE", "DONE"];

const formatDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/** A task is late when its due date has passed and it isn't finished. */
const isOverdue = (task) => {
  if (!task?.dueDate) return false;
  if (SETTLED.includes(String(task.status || "").toUpperCase())) return false;
  const due = new Date(task.dueDate);
  if (Number.isNaN(due.getTime())) return false;
  return due < new Date();
};

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [newTaskModalOpen, setNewTaskModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [editTaskModalOpen, setEditTaskModalOpen] = useState(false);
  const [admin] = useAtom(adminAtom);
  const router = useRouter();
  const { query } = useRouter();

  const [access] = useAtom(accessAtom);
  const [operators, setOperators] = useState([]);

  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const menuRef = useRef(null);

  const getTasks = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("auth/task?page=1&limit=20");
      const allTasks = data.data.tasks.tasks;

      if (router.pathname.startsWith("/admin")) {
        setTasks(allTasks);
      } else {
        const profId = admin?._id || admin?.id;
        const assignedTasks = allTasks.filter(
          (task) => Array.isArray(task.assigne) && task.assigne.includes(profId),
        );
        setTasks(assignedTasks);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const profId = admin?._id || admin?.id;

      // Close dropdown immediately
      setDropdownOpen(null);

      await axios.post(`auth/task/${id}`, {
        status: newStatus,
        prof: profId,
      });

      // Fetch updated tasks
      await getTasks();

      // Open review modal if done
      if (newStatus === "DONE") setOpen(true);
    } catch (e) {
      console.log(e);
    }
  };

  const toggleLock = async (id) => {
    try {
      // call toggle-lock endpoint
      const res = await axios.post(`${SERVER_URL}/api/v5/tasks/${id}/toggle-lock`);
      if (res && res.status >= 200 && res.status < 300) {
        // try to read lock value from multiple possible response shapes
        let newLockValue;
        if (res.data && typeof res.data.lock !== "undefined") newLockValue = res.data.lock;
        else if (res.data && typeof res.data.locked !== "undefined") newLockValue = res.data.locked;
        else if (res.data && res.data.data && typeof res.data.data.lock !== "undefined") newLockValue = res.data.data.lock;
        else if (res.data && res.data.data && typeof res.data.data.locked !== "undefined") newLockValue = res.data.data.locked;

        // update tasks using functional update to avoid stale closures
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === id
              ? { ...task, lock: typeof newLockValue === "boolean" ? newLockValue : !task.lock }
              : task,
          ),
        );

        // also sync selectedTask if it's the one being toggled
        setSelectedTask((prev) =>
          prev && prev._id === id
            ? { ...prev, lock: typeof newLockValue === "boolean" ? newLockValue : !prev.lock }
            : prev,
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleSubtask = async (taskId, subtaskIndex, descriptionIndex) => {
    const { data } = await axios.post(`${SERVER_URL}/graphql`, {
      query: `
        mutation ToggleSubtaskDone($taskId: ID!, $subtaskIndex: Int!, $descriptionIndex: Int!) {
          toggleSubtaskDone(
            taskId: $taskId
            subtaskIndex: $subtaskIndex
            descriptionIndex: $descriptionIndex
          ) {
            _id
            name
            dueDate
            dueTime
            instruction
            status
            lock
            createdAt
            author { _id name image email }
            prof { _id name image email }
            assigne { _id name image email }
            asset { url type }
            images
            subtasks {
              title
              priority
              actions
              attachment { url type }
              images
              description {
                title
                priority
                actions
                attachment { url type }
                images
                done
              }
            }
            comments {
              _id
              authorId
              authorName
              authorImage
              content
              targetType
              subtaskIndex
              descriptionIndex
              createdAt
              updatedAt
            }
          }
        }
      `,
      variables: { taskId, subtaskIndex, descriptionIndex },
    });

    const updatedTask = data?.data?.toggleSubtaskDone;
    if (updatedTask) {
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task._id === taskId ? updatedTask : task)),
      );
      setSelectedTask((prev) => (prev && prev._id === taskId ? updatedTask : prev));
    }
    return updatedTask;
  };

  useEffect(() => {
    getTasks();
    // Fetch operators
    const fetchOperators = async () => {
      try {
        // Try to get orgId from query or admin object
        const orgId = router.pathname.startsWith("/admin")
          ? admin?.orgId || admin?.organizationId || admin?.organization?._id
          : query.page || admin?.orgId || admin?.organizationId || admin?.organization?._id;
        if (!orgId) {
          setOperators([]);
          return;
        }
        const { data } = await axios.get(
          `${SERVER_URL}/api/v5/organization/${orgId}/operators`,
        );
        setOperators(Array.isArray(data) ? data : []);
      } catch (e) {
        setOperators([]);
      }
    };
    fetchOperators();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin, query.page]);

  // The old status menu stayed open until another click landed on it. Closing on
  // outside click and Escape is what users expect from any popover.
  useEffect(() => {
    if (!dropdownOpen) return;
    const onPointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setDropdownOpen(null);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setDropdownOpen(null);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [dropdownOpen]);

  const isAdminRoute = router.pathname.startsWith("/admin");
  const canSetAnyStatus =
    isAdminRoute || checkAccess(access, "Update Task Status");
  const statusOptions = canSetAnyStatus ? ALL_STATUS_OPTIONS : USER_STATUS_OPTIONS;

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setViewModalOpen(true);
  };

  const overdueCount = useMemo(() => tasks.filter(isOverdue).length, [tasks]);

  const filtered = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    return tasks.filter((task) => {
      const status = String(task.status || "").toUpperCase();
      if (statusFilter === "OVERDUE_ONLY" && !isOverdue(task)) return false;
      if (
        statusFilter !== "ALL" &&
        statusFilter !== "OVERDUE_ONLY" &&
        status !== statusFilter
      )
        return false;
      if (q) {
        const haystack = [task.name, task.author?.name, task.instruction]
          .filter(Boolean)
          .map((v) => String(v).toLowerCase());
        if (!haystack.some((v) => v.includes(q))) return false;
      }
      return true;
    });
  }, [tasks, searchValue, statusFilter]);

  const filtersActive = Boolean(searchValue) || statusFilter !== "ALL";

  const clearFilters = () => {
    setSearchValue("");
    setStatusFilter("ALL");
  };

  return (
    <>
      <Panel>
        <Toolbar>
          <SearchInput
            value={searchValue}
            onChange={setSearchValue}
            placeholder="Search tasks by name or author…"
            className="w-full sm:w-72"
          />
          <Select
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "ALL", label: "All statuses" },
              ...(overdueCount > 0
                ? [{ value: "OVERDUE_ONLY", label: `Overdue (${overdueCount})` }]
                : []),
              ...ALL_STATUS_OPTIONS.map((o) => ({
                value: o.value,
                label: o.label,
              })),
            ]}
          />
          {filtersActive && (
            <Button variant="ghost" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
          {/* Primary action lives at the end of the toolbar, the conventional
              spot for "create" in a table view. */}
          <Button
            variant="primary"
            className="ml-auto"
            onClick={() => setNewTaskModalOpen(true)}
          >
            Create task
          </Button>
        </Toolbar>

        {loading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={filtersActive ? "No tasks match those filters" : "No tasks yet"}
            description={
              filtersActive
                ? "Try a different status or clear the filters."
                : "Create a task to get work moving."
            }
            action={
              filtersActive ? (
                <Button variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : (
                <Button variant="primary" onClick={() => setNewTaskModalOpen(true)}>
                  Create task
                </Button>
              )
            }
          />
        ) : (
          <>
            <Table>
              <THead>
                <Tr>
                  <Th>Task</Th>
                  <Th>Author</Th>
                  <Th>Due</Th>
                  <Th>Status</Th>
                  <Th align="right">Actions</Th>
                </Tr>
              </THead>
              <TBody>
                {filtered.map((task) => {
                  const status = String(task.status || "").toUpperCase();
                  const meta = STATUS_META[status] || {
                    label: task.status || "Unknown",
                    tone: "neutral",
                  };
                  const created = formatDate(task.createdAt);
                  const due = formatDate(task.dueDate);
                  const late = isOverdue(task);

                  return (
                    <Tr key={task._id}>
                      <Td>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleTaskClick(task)}
                            className="truncate text-left font-medium text-slate-900 underline-offset-2 hover:underline"
                          >
                            {task.name || "Untitled task"}
                          </button>
                          {/* Lock state was an emoji with no label. */}
                          {task.lock && <Tag>Locked</Tag>}
                        </div>
                        {created && (
                          <p className="mt-0.5 text-xs text-slate-500">
                            Created {created}
                          </p>
                        )}
                      </Td>
                      <Td>
                        <CellStack
                          primary={task.author?.name || "Unknown"}
                          secondary={task.author?.email}
                        />
                      </Td>
                      <Td>
                        {due ? (
                          <span
                            className={
                              late
                                ? "font-medium text-rose-600"
                                : "text-slate-600"
                            }
                          >
                            {due}
                            {late && (
                              <span className="ml-1 text-xs font-normal">
                                (overdue)
                              </span>
                            )}
                          </span>
                        ) : (
                          <Empty />
                        )}
                      </Td>
                      <Td>
                        <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
                      </Td>
                      <Td align="right">
                        <div className="flex items-center justify-end gap-1">
                          <RowAction onClick={() => handleTaskClick(task)}>
                            View
                          </RowAction>
                          <RowAction
                            onClick={() => {
                              setEditTask(task);
                              setEditTaskModalOpen(true);
                            }}
                          >
                            Edit
                          </RowAction>
                          <RowAction onClick={() => toggleLock(task._id)}>
                            {task.lock ? "Unlock" : "Lock"}
                          </RowAction>

                          <div
                            className="relative"
                            ref={dropdownOpen === task._id ? menuRef : null}
                          >
                            <RowAction
                              tone="primary"
                              aria-haspopup="menu"
                              aria-expanded={dropdownOpen === task._id}
                              onClick={() =>
                                setDropdownOpen(
                                  dropdownOpen === task._id ? null : task._id,
                                )
                              }
                            >
                              Set status
                            </RowAction>

                            {dropdownOpen === task._id && (
                              <div
                                role="menu"
                                className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                              >
                                {statusOptions.map((option) => {
                                  const current = option.value === status;
                                  return (
                                    <button
                                      key={option.value}
                                      role="menuitem"
                                      onClick={() =>
                                        updateStatus(task._id, option.value)
                                      }
                                      className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                                        current
                                          ? "font-medium text-slate-900"
                                          : "text-slate-600"
                                      }`}
                                    >
                                      {option.label}
                                      {/* Marks the status the task is already in,
                                          so admins aren't guessing. */}
                                      {current && (
                                        <span className="text-xs text-slate-400">
                                          current
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </Td>
                    </Tr>
                  );
                })}
              </TBody>
            </Table>
            <TableFooter>
              <span>
                Showing {filtered.length} of {tasks.length}
              </span>
              {overdueCount > 0 && (
                <span className="font-medium text-rose-600">
                  {overdueCount} overdue
                </span>
              )}
            </TableFooter>
          </>
        )}
      </Panel>

      <Reviews open={open} handelClick={() => setOpen(false)} />
      <TaskViewModal
        open={viewModalOpen}
        task={selectedTask}
        onToggleSubtask={toggleSubtask}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedTask(null);
        }}
      />
      <NewTask
        open={newTaskModalOpen}
        handelClick={() => setNewTaskModalOpen(false)}
        task={null}
        operators={operators}
      />
      <NewTask
        open={editTaskModalOpen}
        handelClick={() => {
          setEditTaskModalOpen(false);
          setEditTask(null);
        }}
        task={editTask}
        operators={operators}
      />
    </>
  );
};

export default Tasks;
