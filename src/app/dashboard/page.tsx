import { AddTodoComponent, Todo, TodoComponent } from "../todos";
import {db} from "~/server/db";
import {revalidatePath} from "next/cache";
import {auth} from "@clerk/nextjs";

export default async function HomePage() {
  const { userId} = auth();

  if (!userId) throw new Error("No user id");

  const todos: Todo[] = await db.todo.findMany({ where: { userId } });

  return (
    <main>
      <h1 className="todos-title">todos</h1>
      <div className="todos-card">
        <AddTodoComponent addTodo={async title => {
            "use server"

            const { userId} = auth();

            if (!userId) throw new Error("No user id");

            await db.todo.create({
                data: {
                title,
                userId,
                completed: false,
                },
            });

            revalidatePath("/dashboard");
        }} />

        {todos?.length ? (
          todos.map((todo) => <TodoComponent todo={todo} key={todo.id} toggleCompleted={async todo => {
              "use server"
                const { userId} = auth();
                if (!userId) throw new Error("No user id");
                await db.todo.update({
                    where: {
                        id: todo.id,
                        userId,
                    },
                    data: {
                    completed: !todo.completed,
                    },
                });

              revalidatePath("/dashboard");
          }} deleteTodo={async todo => {
              "use server"
              const { userId} = auth();
              if (!userId) throw new Error("No user id");
              await db.todo.delete({
                    where: {
                    id: todo.id,
                        userId,

                    },
                });


              revalidatePath("/dashboard");
          }}/>)
        ) : (
          <div className="flex">
            <div className="todos-text">No todos found</div>
          </div>
        )}
      </div>
    </main>
  );
}
