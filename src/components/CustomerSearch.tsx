import { A } from '@solidjs/router';
import { For, Show } from 'solid-js';
import { createServerAction$, redirect } from 'solid-start/server';
import { db } from '~/lib/data';
import { isLoggedIn } from '~/lib/session';

export default () => {
  const [customers, searchCustomers] = createServerAction$(
    async (query: string, { request }) => {
      if (!(await isLoggedIn(request))) {
        return redirect('/login');
      }

      return db.customer.findMany({
        where: {
          OR: [
            {
              firstName: {
                contains: query,
              },
            },
            {
              lastName: {
                contains: query,
              },
            },
            {
              email: {
                contains: query,
              },
            },
          ],
        },
      });
    }
  );

  let debounceTimeout: NodeJS.Timeout | undefined = undefined;

  const onSearchInput = (query: string) => {
    customers.clear();
    clearTimeout(debounceTimeout);
    if (query === '') {
      return;
    }

    debounceTimeout = setTimeout(() => {
      searchCustomers(query);
    }, 500);
  };

  return (
    <div>
      <label
        for="email"
        class="block text-sm font-medium leading-6 text-gray-900"
      >
        Search customers
      </label>
      <div class="mt-2 flex rounded-md shadow-sm">
        <div class="relative flex flex-grow items-stretch focus-within:z-10">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              class="h-5 w-5 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z" />
            </svg>
          </div>
          <input
            type="text"
            name="search"
            onInput={(e) => onSearchInput(e.target.value)}
            class="block w-full rounded-none rounded-l-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Surname or Email"
          />
        </div>
      </div>
      <Show when={customers.pending}>
        <p>Loading...</p>
      </Show>
      <Show when={customers.result}>
        <table class="min-w-full divide-y divide-gray-300">
          <tbody class="bg-white">
            <For each={customers.result}>
              {(customer) => (
                <tr>
                  <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">
                    <A href={`/admin/customer/${customer.id}`}>
                      <span class="text-indigo-600 underline">
                        {customer.firstName} {customer.lastName}
                      </span>
                    </A>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {customer.email}
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </Show>
    </div>
  );
};
