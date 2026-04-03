import Link from "next/link"
import Klijent from "./Klijent"

export default function Test()
{
 

  

  return <div className="">
    <p className="text-2xl">hello world!</p>
    <div>
      <p>this is client rendered</p>
      <div className="my-4">
        <Link className="underline" href="/server-auth">Go to server auth page</Link>
      </div>
      <Klijent />
    </div>
  </div>
}