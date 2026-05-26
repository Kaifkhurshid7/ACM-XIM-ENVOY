export const extractArray = (payload, keys = []) => {
    if (Array.isArray(payload)) return payload;

    for (const key of keys) {
        const value = payload?.[key];
        if (Array.isArray(value)) return value;
    }

    return [];
};

export const extractObject = (payload, keys = []) => {
    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
        for (const key of keys) {
            const value = payload[key];
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                return value;
            }
        }

        return payload;
    }

    return null;
};

export const extractToken = (payload) =>
    payload?.token || payload?.data?.token || payload?.accessToken || payload?.jwt || null;

export const extractErrorMessage = (error, fallback = 'Something went wrong.') =>
    error?.response?.data?.msg ||
    error?.response?.data?.message ||
    error?.message ||
    fallback;
