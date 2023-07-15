import { For } from 'solid-js';
import { useRouteData } from 'solid-start';
import { createServerData$, redirect } from 'solid-start/server';
import CustomerSearch from '~/components/CustomerSearch';
import { isLoggedIn } from '~/lib/session';

export const routeData = () => {
  return createServerData$(async (_, { request }) => {
    if (!(await isLoggedIn(request))) {
      throw redirect('/login');
    }

    // return data.getAllCustomers();
  });
};

export default () => {
  // const customers = useRouteData<typeof routeData>();

  return (
    <>
      <CustomerSearch />
      {/* <table class="min-w-full divide-y divide-gray-300">
        <thead>
          <tr>
            <th
              scope="col"
              class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3"
            >
              Name
            </th>
            <th
              scope="col"
              class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Paid
            </th>
            <th
              scope="col"
              class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Credit
            </th>
          </tr>
        </thead>
        <tbody class="bg-white">
          <For each={customers()}>
            {(customer) => (
              <tr class="even:bg-gray-50">
                <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">
                  {customer.firstName} {customer.lastName}
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  ${customer.id}
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  ${customer.id}
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table> */}
    </>
  );
};
