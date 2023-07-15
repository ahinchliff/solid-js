import { createCookieSessionStorage } from 'solid-start/session';

const SESSION_ADMIN_PROPERTY = 'isAdmin';

const storage = createCookieSessionStorage({
  cookie: {
    name: 'session',
    secure: true,
    secrets: [process.env.SESSION_SECRET as string],
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export const getSession = (request: Request) => {
  return storage.getSession(request.headers.get('Cookie'));
};

export const createSession = async () => {
  const session = await storage.getSession();
  session.set(SESSION_ADMIN_PROPERTY, 'true');
  return storage.commitSession(session);
};

export const logout = async (request: Request) => {
  const session = await getSession(request);
  return storage.destroySession(session);
};

export const isLoggedIn = async (request: Request) => {
  const session = await getSession(request);
  const isAdmin = session.get(SESSION_ADMIN_PROPERTY);
  return isAdmin === 'true';
};
