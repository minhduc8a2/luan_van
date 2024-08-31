import { Link, Head } from "@inertiajs/react";

export default function Welcome({ auth, workspaces }) {
    return (
        <div className="">
            <h1 className="text-3xl">Workspaces</h1>
            <ul className="list-none">
                {workspaces.map((workspace) => (
                    <li key={workspace.id} className=" hover:bg-slate-200">
                        <Link
                            href={route("workspace.show", workspace.id)}
                            className="w-full h-full block p-4"
                        >
                            {workspace.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
