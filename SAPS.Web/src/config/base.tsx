// export const mockUrl =
//   "https://a12fd66f-74be-4779-97a3-4fef023e9291.mock.pstmn.io";
// export const localUrl = "https://192.168.1.25:7136";
// export const localUrl2 = "https://localhost:7284";
// export const apiUrl = localUrl;
// export const OWNER_ROLE = "parkinglotowner".toLowerCase();

// export const ADMIN_ROLE = "admin".toLowerCase();

export const mockUrl = import.meta.env.VITE_MOCK_URL as string;
export const localUrl = import.meta.env.VITE_LOCAL_URL as string;
export const localUrl2 = import.meta.env.VITE_LOCAL_URL2 as string;


const apiUrl = import.meta.env.VITE_API_URL;
export const ADMIN_ROLE = import.meta.env.VITE_ADMIN_ROLE;
export const OWNER_ROLE = import.meta.env.VITE_OWNER_ROLE;

// export const apiUrl = import.meta.env.VITE_API_URL as string
// export const OWNER_ROLE = (import.meta.env.VITE_OWNER_ROLE as string).toLowerCase();
// export const ADMIN_ROLE = (import.meta.env.VITE_ADMIN_ROLE as string).toLowerCase();

