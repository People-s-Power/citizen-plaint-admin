import React, { useEffect, useRef, useState } from "react";
import {
  Panel,
  Table,
  THead,
  TBody,
  Th,
  Tr,
  Td,
  CellStack,
  StatusPill,
  RowAction,
  Empty,
  EmptyState,
  TableFooter,
} from "@/components/ui/admin-kit";
 
const PLAINT_ORG = "https://www.theplaint.org";
const PLAINT_COM = "https://www.theplaint.com";

/** Public URL for a piece of content — petitions live under /campaigns/:slug. */
const publicPath = (item, type) =>
  type === "petition"
    ? `/campaigns/${item.slug}`
    : `/${type.charAt(0).toUpperCase() + type.slice(1)}?page=${item._id}`;

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

const formatCount = (n) => Number(n || 0).toLocaleString();

/**
 * Row overflow menu. Replaces the rsuite dropdown so the menu matches the rest
 * of the admin surface and closes on outside click / Escape like a native menu.
 */
const RowMenu = ({ item, type, canModerate, editItem }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const path = publicPath(item, type);
  const itemClass =
    "block w-full px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50";

  return (
    <div className="relative inline-block" ref={ref}>
      <RowAction
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        More
      </RowAction>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          <a
            role="menuitem"
            className={itemClass}
            href={`${PLAINT_ORG}/promote?slug=${item._id}&view=true`}
            target="_blank"
            rel="noreferrer"
          >
            Promote
          </a>
          <div className="my-1 border-t border-slate-100" />
          {/* Share was a nested submenu two clicks deep — both domains are now
              one click away. */}
          <p className="px-3 pb-1 pt-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Open on
          </p>
          <a
            role="menuitem"
            className={itemClass}
            href={`${PLAINT_ORG}${path}`}
            target="_blank"
            rel="noreferrer"
          >
            theplaint.org
          </a>
          <a
            role="menuitem"
            className={itemClass}
            href={`${PLAINT_COM}${path}`}
            target="_blank"
            rel="noreferrer"
          >
            theplaint.com
          </a>
          {canModerate && (
            <>
              <div className="my-1 border-t border-slate-100" />
              <button
                type="button"
                role="menuitem"
                className={itemClass}
                onClick={() => {
                  editItem(item._id, "Active");
                  setOpen(false);
                }}
              >
                Mark as active
              </button>
              <button
                type="button"
                role="menuitem"
                className="block w-full px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                onClick={() => {
                  editItem(item._id, "Blocked");
                  setOpen(false);
                }}
              >
                Block content
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const Content = ({ contents, users, type, editItem }) => {
  const canModerate = type === "petition";

  const getAuthor = (id) => {
    let name;
    (users || []).forEach((user) => {
      if (String(user._id) === String(id)) {
        name = user.name;
      }
    });
    return name || "Unknown";
  };

  const rows = contents || [];

  return (
    <Panel>
      {rows.length === 0 ? (
        <EmptyState
          title="Nothing published yet"
          description={`New ${type} content will appear here as it's created.`}
        />
      ) : (
        <>
          <Table>
            <THead>
              <Tr>
                <Th>Content</Th>
                <Th>Author</Th>
                <Th>Status</Th>
                <Th align="right">Promoted views</Th>
                <Th align="right">Views</Th>
                <Th align="right">Endorsements</Th>
                <Th align="right">Actions</Th>
              </Tr>
            </THead>
            <TBody>
              {rows.map((item, index) => {
                const itemTitle =
                  item?.title ||
                  item?.name ||
                  item?.caption ||
                  String(item?.body || "").slice(0, 40) ||
                  "Untitled";
                const itemImage = item?.asset?.[0]?.url || "/logo.png";
                const authorId = item?.author?._id || item?.author;
                const isActive =
                  String(item.status || "").toLowerCase() === "active";
                const created = formatDate(item?.createdAt);

                return (
                  <Tr key={item?._id || index}>
                    <Td>
                      <a
                        className="flex items-center gap-3"
                        href={`${PLAINT_ORG}${publicPath(item, type)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img
                          className="h-9 w-9 shrink-0 rounded-md border border-slate-200 object-cover"
                          src={itemImage}
                          alt=""
                        />
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-slate-900 underline-offset-2 hover:underline">
                            {itemTitle}
                          </span>
                          {created && (
                            <span className="block text-xs text-slate-500">
                              {created}
                            </span>
                          )}
                        </span>
                      </a>
                    </Td>
                    <Td>
                      <a
                        className="hover:underline"
                        target="_blank"
                        rel="noreferrer"
                        href={`${PLAINT_ORG}/user?page=${authorId}`}
                      >
                        <CellStack primary={getAuthor(authorId)} />
                      </a>
                    </Td>
                    <Td>
                      {/* Status used to be an unlabelled coloured dot — now a
                          readable pill, which also works for screen readers. */}
                      <StatusPill tone={isActive ? "success" : "danger"}>
                        {isActive ? "Active" : "Blocked"}
                      </StatusPill>
                    </Td>
                    <Td align="right">
                      <span className="tabular-nums text-slate-600">
                        {formatCount(item?.numberOfPaidViewsCount)}
                      </span>
                    </Td>
                    <Td align="right">
                      <span className="tabular-nums text-slate-600">
                        {formatCount(item?.views?.length)}
                      </span>
                    </Td>
                    <Td align="right">
                      {item?.endorsements?.length ? (
                        <span className="tabular-nums text-slate-600">
                          {formatCount(item.endorsements.length)}
                        </span>
                      ) : (
                        <Empty />
                      )}
                    </Td>
                    <Td align="right">
                      <RowMenu
                        item={item}
                        type={type}
                        canModerate={canModerate}
                        editItem={editItem}
                      />
                    </Td>
                  </Tr>
                );
              })}
            </TBody>
          </Table>
          <TableFooter>
            <span>
              Showing {rows.length} {rows.length === 1 ? "item" : "items"}
            </span>
          </TableFooter>
        </>
      )}
    </Panel>
  );
};

export default Content;
