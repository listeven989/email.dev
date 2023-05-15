// @ts-nocheck

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const RoutesList = ({ routes }) => {
  const router = useRouter();

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Available Routes</h2>
      <ul className="space-y-2">
        {routes.map((route, index) => (
          <li key={index} className="flex items-center">
            <Link href={route.path}>
              <span
                className={`${
                  router.pathname === route.path
                    ? 'text-blue-600 font-bold'
                    : 'text-gray-700'
                } hover:text-blue-600 cursor-pointer`}
              >
                {route.path}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoutesList;