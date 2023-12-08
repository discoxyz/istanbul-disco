export const ironOptions = {
  cookieName: "siwe",
  password: process.env.AUTH0_CLIENT_SECRET as string,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};