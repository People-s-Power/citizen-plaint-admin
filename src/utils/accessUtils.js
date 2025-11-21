// Utility to check if a user has the required access for an action
// accessState: current access value (string or array)
// requiredAccess: string or array of allowed access values
// action: function to execute if access is allowed
// fallback: function to execute or alert if access is denied

export function checkAccess(accessState, requiredAccess, action, fallback) {
    // If accessState is explicitly null, treat it as full access (no restrictions)
    if (accessState === null) {
        const noCallbacks = typeof action === 'undefined' && typeof fallback === 'undefined';
        if (!noCallbacks && typeof action === 'function') action();
        return true;
    }
    // Extract permission strings from various possible shapes
    const extractAccessArray = (input) => {
        if (!input && input !== 0) return [];
        if (Array.isArray(input)) return input;
        if (typeof input === 'string') return [input];
        if (typeof input === 'object') {
            // Common keys where permissions might live
            if (Array.isArray(input.permissions)) return input.permissions;
            if (Array.isArray(input.access)) return input.access;
            if (Array.isArray(input.roles)) return input.roles;
            // If object is a map of flags, return keys with truthy value
            const flags = Object.keys(input).filter(k => !!input[k]);
            if (flags.length) return flags;
            return [JSON.stringify(input)];
        }
        return [String(input)];
    };

    const normalize = (str) => String(str).toLowerCase().trim().replace(/\s+/g, '_');

    const accessArr = extractAccessArray(accessState).map(normalize);
    const requiredArr = extractAccessArray(requiredAccess).map(normalize);

    // Check if any required access is present
    const hasAccess = accessArr.some(acc => requiredArr.includes(acc));

    // If no callbacks provided, act as pure boolean checker
    const noCallbacks = typeof action === 'undefined' && typeof fallback === 'undefined';
    if (noCallbacks) return hasAccess;

    if (hasAccess) {
        if (typeof action === 'function') {
            action();
        }
        return true;
    } else {
        if (typeof fallback === 'function') {
            fallback();
        } else {
            alert('You do not have permission to perform this action.');
        }
        return false;
    }
}
