import { Show } from 'solid-js';
import { FormError } from 'solid-start/data';
import {
  createServerAction$,
  createServerData$,
  redirect,
} from 'solid-start/server';
import { createSession, isLoggedIn } from '~/lib/session';

export const routeData = () => {
  return createServerData$(async (_, { request }) => {
    if (await isLoggedIn(request)) {
      throw redirect('/admin');
    }
  });
};

export default () => {
  const [loggingIn, { Form }] = createServerAction$(async (form: FormData) => {
    const password = form.get('password');

    if (
      !process.env.ADMIN_PASSWORD ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      throw new FormError('Incorrect password');
    }

    const cookie = await createSession();

    return redirect('/admin', {
      headers: {
        'Set-Cookie': cookie,
      },
    });
  });

  return (
    <div class="flex min-h-full flex-1">
      <div class="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div class="mx-auto w-full max-w-sm lg:w-96">
          <h2 class="mt-8 text-3xl font-bold leading-9 tracking-tight text-gray-900">
            Back Office
          </h2>

          <div class="mt-10">
            <Form action="#" method="post" class="space-y-6">
              <div>
                <label class="block text-sm font-medium leading-6 text-gray-900">
                  Password
                </label>
                <div class="mt-2">
                  <input
                    name="password"
                    type="password"
                    autocomplete="current-password"
                    class="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              <Show when={loggingIn.error}>
                <p class="text-red-500">{loggingIn.error.message}</p>
              </Show>
              <div>
                <button
                  type="submit"
                  class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Sign in
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>
      <div class="relative hidden w-0 flex-1 lg:block">
        <img
          class="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1567696911980-2eed69a46042?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80"
        />
      </div>
    </div>
  );
};
