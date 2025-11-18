export const ALL_PERMISSIONS = {
    EVENTS: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/events', module: "EVENTS" },
        CREATE: { method: "POST", apiPath: '/api/v1/events', module: "EVENTS" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/events', module: "EVENTS" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/events/{id}', module: "EVENTS" },
    },
    JOBS: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/jobs', module: "JOBS" },
        CREATE: { method: "POST", apiPath: '/api/v1/jobs', module: "JOBS" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/jobs', module: "JOBS" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/jobs/{id}', module: "JOBS" },
    },
    PERMISSIONS: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/permissions', module: "PERMISSIONS" },
        CREATE: { method: "POST", apiPath: '/api/v1/permissions', module: "PERMISSIONS" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/permissions', module: "PERMISSIONS" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/permissions/{id}', module: "PERMISSIONS" },
    },
    RESUMES: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/resumes', module: "RESUMES" },
        CREATE: { method: "POST", apiPath: '/api/v1/resumes', module: "RESUMES" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/resumes', module: "RESUMES" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/resumes/{id}', module: "RESUMES" },
    },
    ROLES: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/roles', module: "ROLES" },
        CREATE: { method: "POST", apiPath: '/api/v1/roles', module: "ROLES" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/roles', module: "ROLES" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/roles/{id}', module: "ROLES" },
    },
    USERS: {
        GET_PAGINATE: { method: "GET", apiPath: '/api/v1/users', module: "USERS" },
        CREATE: { method: "POST", apiPath: '/api/v1/users', module: "USERS" },
        UPDATE: { method: "PUT", apiPath: '/api/v1/users', module: "USERS" },
        DELETE: { method: "DELETE", apiPath: '/api/v1/users/{id}', module: "USERS" },
    },
    POSTS: {
        GET_BY_EVENT: { method: "GET", apiPath: '/api/v1/events/{id}/posts', module: "POSTS" },
        CREATE: { method: "POST", apiPath: '/api/v1/events/{id}/posts', module: "POSTS" },
    },
    COMMENTS: {
        GET_BY_POST: { method: "GET", apiPath: '/api/v1/posts/{id}/comments', module: "COMMENTS" },
        CREATE: { method: "POST", apiPath: '/api/v1/posts/{id}/comments', module: "COMMENTS" },
    },
    LIKES: {
        CREATE_POST: { method: "POST", apiPath: '/api/v1/posts/{id}/likes', module: "LIKES" },
        CREATE_COMMENT: { method: "POST", apiPath: '/api/v1/comments/{id}/likes', module: "LIKES" },
    },
}

export const ALL_MODULES = {
    EVENTS: 'EVENTS',
    FILES: 'FILES',
    JOBS: 'JOBS',
    PERMISSIONS: 'PERMISSIONS',
    RESUMES: 'RESUMES',
    ROLES: 'ROLES',
    USERS: 'USERS',
    SUBSCRIBERS: 'SUBSCRIBERS',
    POSTS: 'POSTS',
    COMMENTS: 'COMMENTS',
    LIKES: 'LIKES'
}
