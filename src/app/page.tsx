import { DataInput } from "@/components/data-input";

export default function Home() {
  return <>
    <header className="my-3 flex justify-center flex-co">
      <div className="">
        <h3 className="text-xl sm:text-3xl md:text-5xl font-rubik font-normal text-center">Internal Rate of Return</h3>
      </div>
    </header>
    <main className="container">
      <DataInput />
    </main>
  </>
}
