import { For, Show } from 'solid-js';
import { useRouteData, useSearchParams } from 'solid-start';
import { createServerAction$, createServerData$ } from 'solid-start/server';
import { stripe } from '~/lib/payments';

export const routeData = () => {
  return createServerData$(async () => {
    const products = await stripe.products.list({
      expand: ['data.default_price'],
    });

    return products.data
      .map((product) => {
        const price = product.default_price as {
          id: string;
          unit_amount: number;
        };

        const value = Number(product.name.split(' ')[0].replace('$', ''));

        return {
          id: product.id,
          value,
          name: product.name,
          price: price.unit_amount / 100,
          priceId: price.id,
        };
      })
      .sort((a, b) => a.price - b.price);
  });
};

export default () => {
  const [_, buy] = createServerAction$(async (priceId: string) => {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.VITE_APP_URL}?success=true`,
      cancel_url: `${process.env.VITE_APP_URL}`,
    });

    return Response.redirect(session.url as string);
  });

  const products = useRouteData<typeof routeData>();
  const [searchParams] = useSearchParams();

  return (
    <div class="bg-gray-900 h-screen">
      <Show when={searchParams.success === 'true'}>
        <div
          class="flex items-center p-4 mb-4 text-sm rounded-lg bg-gray-800 text-green-400 border-green-800"
          role="alert"
        >
          <svg
            class="flex-shrink-0 inline w-4 h-4 mr-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
          </svg>
          <div>
            <span class="font-medium">Purchase Successful!</span> Thank you for
            your purchase. We look forward to see you at Awesome Brewery soon.
          </div>
        </div>
      </Show>

      <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <div class="mx-auto max-w-screen-md text-center mb-8 lg:mb-12">
          <h2 class="mb-4 text-4xl tracking-tight font-extrabold text-white">
            Awesome Brewery
          </h2>
          <p class="mb-8 font-light  sm:text-xl text-gray-400">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque a
            ipsum arcu. Suspendisse tincidunt consequat risus in vestibulum.
            Nunc dignissim suscipit orci in accumsan.
          </p>
        </div>
        <div class="space-y-8 lg:grid lg:grid-cols-3 sm:gap-6 xl:gap-10 lg:space-y-0">
          <For each={products()}>
            {(product) => {
              return (
                <div class="flex flex-col p-6 mx-auto max-w-lg text-center rounded-lg border shadow border-gray-600 xl:p-8 bg-gray-800">
                  <h3 class="text-white mb-4 text-3xl font-bold">
                    {product.name}
                  </h3>
                  <p class="font-light  sm:text-lg text-gray-400">
                    ${product.value} food and drink credits to be spent at any
                    time
                  </p>
                  <div class="flex justify-center items-baseline my-8">
                    <span class="text-green-500 mr-2 text-2xl font-semibold">
                      ${product.value - product.price} Free
                    </span>
                  </div>

                  <a
                    onClick={() => buy(product.priceId)}
                    class="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 font-medium rounded-lg text-sm px-5 py-2.5 text-centertext-white  hover:cursor-pointer"
                  >
                    Buy now - ${product.price}
                  </a>
                </div>
              );
            }}
          </For>
        </div>
      </div>
    </div>
  );
};
