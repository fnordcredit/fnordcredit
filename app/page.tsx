import prisma from '@lib/prisma';
import Link from 'next/link';
import Avatar from '@components/Avatar';
import AppBar from '@components/AppBar';
import NewAccountDialog from './newaccount';

export default async function Index() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      updatedAt: true,
      avatar: true,
      credit: true,
    },
  });
  return (
    <>
      <AppBar>
        <div className="flex-grow" />
        <NewAccountDialog />
      </AppBar>
      <div className="flex flex-wrap my-2 mx-auto content-around">
        { users.map((x) => (
          <Link href={`/user/${x.id.toString()}`} className="transition-colors duration-200 rounded-md flex bg-slate-50 dark:bg-primary-700 py-2 px-2 m-6 cursor-pointer dark:hover:bg-primary-500 hover:bg-primary-100 h-28 w-56 drop-shadow-lg dark:text-slate-200" key={x.id}>
            <Avatar image={x.avatar} alt={x.name} /> 
            <span className="font-bold mx-3 my-auto text-right block w-24 text-primary-500 dark:text-slate-200">
              { x.name }
              <br/>
              <span className="font-normal text-sm">
                { (x.credit / 100).toFixed(2).toString() + "€" }
              </span>
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
