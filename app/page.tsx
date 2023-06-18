import prisma from '@lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import Avatar from './components/Avatar';

export default async function Index() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      updatedAt: true,
      avatar: true,
      credit: true
    }
  });
  return (
    <div className="flex flex-wrap my-2 mx-auto content-around">
      { users.map((x) => (
        <Link href={`/user/${x.id.toString()}`} className="transition-colors duration-200 rounded-md flex bg-slate-50 dark:bg-primary-700 py-2 px-2 m-6 cursor-pointer dark:hover:bg-primary-500 hover:bg-primary-100 h-28 w-56 drop-shadow-lg dark:text-slate-200">
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
  );
}

/*
 *      { users.map((x) => (
        <Link href={`/user/${x.id.toString()}`} className="bg-primary-500 p-4 m-2 cursor-pointer hover:bg-primary-300 h-24 w-64 flex drop-shadow-md text-slate-200">
          { x.avatar != null
            ? <Image src={x.avatar} className="rounded-full shadow-lg" alt="" width="64" height="64" />
            : <div className="rounded-full shadow-lg bg-slate-600 text-slate-400 w-20 h-16 px-4 py-2 text-5xl">{x.name.toUpperCase()[0]}</div>}
          <span className="font-bold mx-3 my-1 text-right block w-full">
            { x.name }
            <br/>
            <span className="font-normal">
              { (x.credit / 100).toFixed(2).toString() + "€" }
            </span>
          </span>
        </Link>
      ))}
{ users.map((x) => (
        <Link href={`/user/${x.id.toString()}`} className="m-2 p-1 backdrop-blur-sm bg-white/30">
          { x.avatar != null
            ? <Image src={x.avatar} className={`rounded-full ${getUserColor(x.id)} mx-4`} alt="" width="96" height="96" />
            : <div className={`rounded-full ${getUserColor(x.id)} w-24 h-24 mx-4 px-4 py-4 text-7xl text-center`}>{x.name.toUpperCase()[0]}</div>}
          <div className="font-bold text-center block w-full">
            { x.name }
            <br/>
            <span className="font-normal">
              { (x.credit / 100).toFixed(2).toString() + "€" }
            </span>
          </div>
        </Link>
      ))}

      */
