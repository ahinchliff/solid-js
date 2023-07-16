import { A } from '@solidjs/router';
import { Outlet } from 'solid-start';
import { createServerAction$, redirect } from 'solid-start/server';
import { logout } from '~/lib/session';

export default () => {
  const [, { Form }] = createServerAction$(async (_: FormData, { request }) => {
    const cookie = await logout(request);

    return redirect('/login', {
      headers: {
        'Set-Cookie': cookie,
      },
    });
  });

  return (
    <>
      <div class="flex items-center justify-between px-2 py-4 bg-blue-500">
        <A href="/admin">
          <h1 class="text-2xl text-white">Back office</h1>
        </A>
        <Form>
          <button
            name="logout"
            type="submit"
            class="ml-3 inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Logout
          </button>
        </Form>
      </div>
      <div class="p-2">
        <Outlet />
      </div>
    </>
  );
};
