import classnames from 'classnames';
import { createEffect, createSignal, For, Show } from 'solid-js';
import { FormError, RouteDataArgs, useRouteData } from 'solid-start';
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

      const creditsBought = await db.purchase.findMany({
        where: {
          customerId: customer.id,
        },
      });

      const creditsUsed = await db.spend.findMany({
        where: {
          customerId: customer.id,
        },
      });

      const history: {
        type: 'bought' | 'spent';
        date: Date;
        value: number;
      }[] = [];

      const creditsPurchased = creditsBought.reduce((sum, purchase) => {
        history.push({
          type: 'bought',
          date: purchase.createdAt,
          value: purchase.credit,
        });
        return sum + purchase.credit;
      }, 0);

      const creditsSpent = creditsUsed.reduce((sum, spend) => {
        history.push({
          type: 'spent',
          date: spend.createdAt,
          value: spend.credit,
        });

        return sum + spend.credit;
      }, 0);

      const balance = creditsPurchased - creditsSpent;

      return {
        customer,
        balance,
        history: history.sort((a, b) => b.date.getTime() - a.date.getTime()),
      };
    },
    { key: () => ['customer', params.id] }
  );
};

export default () => {
  const data = useRouteData<typeof routeData>();
  const [reduceBy, setReduceBy] = createSignal('');

  const [reducingCredits, reduceCredits] = createServerAction$(
    async (data: { customerId: number; reduceBy: string }, { request }) => {
      if (!(await isLoggedIn(request))) {
        return redirect('/login');
      }

      const customerId = Number(data.customerId);
      const reduceBy = Number(data.reduceBy);

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

      if (credits < reduceBy) {
        throw new FormError('Insufficient credits');
      }

      await db.spend.create({
        data: {
          customerId,
          credit: reduceBy,
        },
      });

      return true;
    }
  );

  createEffect(() => {
    if (reducingCredits.result === true) {
      setReduceBy('');
    }
  });

  return (
    <Show when={data()}>
      {(data) => {
        return (
          <div>
            <h1 class="text-2xl">{formatFullName(data().customer)}</h1>
            <h2>{data().customer.email}</h2>
            <p>credits: {data().balance}</p>
            <div class="pt-4">
              <p class="text-xl">Reduce credits</p>
              <input
                name="customerId"
                type="hidden"
                value={data().customer.id}
              />
              <div class="flex mt-2">
                <input
                  name="credit"
                  value={reduceBy()}
                  disabled={reducingCredits.pending}
                  onInput={(e) => {
                    setReduceBy(e.target.value);
                    reducingCredits.clear();
                  }}
                  type="number"
                  placeholder="Reduce credits by"
                  class="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 mr-3"
                />
                <button
                  type="submit"
                  onClick={() =>
                    reduceCredits({
                      customerId: data().customer.id,
                      reduceBy: reduceBy(),
                    })
                  }
                  disabled={
                    reducingCredits.pending ||
                    Number(reduceBy()) > data().balance
                  }
                  class="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 font-medium rounded-lg text-sm px-5 py-2.5 text-centertext-white  hover:cursor-pointer"
                >
                  Reduce
                </button>
              </div>
              <Show when={Number(reduceBy()) > data().balance}>
                <p class="text-red-500">Insufficient credits</p>
              </Show>
            </div>
            <div class="pt-4">
              <p class="text-xl">History</p>
              <table class="min-w-full divide-y divide-gray-300">
                <tbody class="bg-white">
                  <For each={data().history}>
                    {(history) => (
                      <tr class="even:bg-gray-50">
                        <td class="text-sm text-gray-900">
                          {history.date.toLocaleString()}
                        </td>
                        <td
                          class={classnames('py-2 text-sm', {
                            'text-green-500': history.type === 'bought',
                            'text-red-500': history.type === 'spent',
                          })}
                        >
                          {history.type === 'bought' ? '+' : '-'}
                          {history.value}
                        </td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </div>
        );
      }}
    </Show>
  );
};
