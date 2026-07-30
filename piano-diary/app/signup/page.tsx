"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {supabase} from "../lib/supabase";


export default function Signup(){

const router=useRouter();

const [name,setName]=useState("");


async function signup(){


if(!name){
alert("아이디를 입력하세요");
return;
}



const {data:check}=await supabase
.from("users")
.select("*")
.eq("name",name)
.single();



if(check){

alert("이미 있는 아이디입니다.");
return;

}



const {data,error}=await supabase
.from("users")
.insert({
name:name
})
.select()
.single();



if(error){

console.log(error);
alert("회원가입 실패");
return;

}



localStorage.setItem(
"user_id",
data.id
);



router.replace("/");


}



return(

<main className="
min-h-screen
bg-[#F7F8FC]
flex
items-center
justify-center
p-6
text-black
">


<div className="
bg-white
rounded-[32px]
p-8
w-full
max-w-md
">


<h1 className="
text-2xl
font-bold
text-black
">
회원가입
</h1>


<input

className="
mt-8
w-full
border
rounded-xl
p-4
"

placeholder="사용할 아이디"

value={name}

onChange={(e)=>setName(e.target.value)}

/>



<button

onClick={signup}

className="
mt-6
w-full
rounded-2xl
bg-[#8CCBFF]
p-4
text-white
font-bold
text-black
"

>

가입하기

</button>



<button

onClick={()=>router.push("/login")}

className="
mt-4
w-full
border
rounded-2xl
p-4
"

>

로그인으로 돌아가기

</button>


</div>


</main>

);


}