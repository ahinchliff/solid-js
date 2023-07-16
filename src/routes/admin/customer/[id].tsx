import { createEffect, createSignal, Show } from 'solid-js';
import { RouteDataArgs, useRouteData } from 'solid-start';
import {
  createServerAction$,
  createServerData$,
  redirect,
} from 'solid-start/server';
import { db } from '~/lib/data';
import { formatFullName } from '~/lib/format';
import { isLoggedIn } from '~/lib/session';

export const routeData = ({ params }: RouteDataArgs) => {
  return createServerData$(
    async ([, id], { request }) => {
      if (!(await isLoggedIn(request))) {
        throw redirect('/login');
      }

      const customer = await db.customer.findFirst({
        where: {
          id: Number(id),
        },
      });

      if (!customer) {
        throw redirect('/admin');
      }

      const purchases = await db.purchase.findMany({
        where: {
          customerId: customer.id,
        },
      });

      const spends = await db.spend.findMany({
        where: {
          customerId: customer.id,
        },
      });

      const creditsPurchased = purchases.reduce(
        (sum, purchase) => sum + purchase.credit,
        0
      );

      const creditsSpent = spends.reduce((sum, spend) => sum + spend.credit, 0);

      const credits = creditsPurchased - creditsSpent;

      return { customer, credits };
    },
    { key: () => ['customer', params.id] }
  );
};

export default () => {
  const data = useRouteData<typeof routeData>();
  const [credit, setCredit] = createSignal('');

  const [subtractCreditRes, { Form }] = createServerAction$(
    async (formData: FormData, { request }) => {
      if (!(await isLoggedIn(request))) {
        return redirect('/login');
      }

      const customerId = Number(formData.get('customerId'));
      const credit = Number(formData.get('credit'));

      const purchases = await db.purchase.findMany({
        where: {
          customerId: customerId,
        },
      });

      const spends = await db.spend.findMany({
        where: {
          customerId: customerId,
        },
      });

      const creditsPurchased = purchases.reduce(
        (sum, purchase) => sum + purchase.credit,
        0
      );

      const creditsSpent = spends.reduce((sum, spend) => sum + spend.credit, 0);

      const credits = creditsPurchased - creditsSpent;

      if (credits - credit < 0) {
        return true;
      }

      await db.spend.create({
        data: {
          customerId,
          credit,
        },
      });

      return true;
    }
  );

  createEffect(() => {
    if (subtractCreditRes.result === true) {
      setCredit('');
    }
  });

  return (
    <Show when={data()}>
      {(data) => {
        return (
          <div>
            <h1 class="text-2xl">{formatFullName(data().customer)}</h1>
            <h2>{data().customer.email}</h2>
            <div class="pt-4">
              <p>Credits: {data().credits}</p>
              <Form>
                <input
                  name="customerId"
                  type="hidden"
                  value={data().customer.id}
                />
                <input
                  name="credit"
                  value={credit()}
                  onInput={(e) => setCredit(e.target.value)}
                  type="number"
                  placeholder="Reduce credits by"
                  class="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </Form>
            </div>
          </div>
        );
      }}
    </Show>
  );
};
