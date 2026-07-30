"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function Home() {

  const router = useRouter();


  const [eventDates,setEventDates]=useState<string[]>([]);
const [academyDates,setAcademyDates]=useState<string[]>([]);

  const [examDate,setExamDate]=useState("");

  const [examTitle,setExamTitle]=useState("");

  const [editTitle,setEditTitle]=useState(false);
  const [dateOpen,setDateOpen]=useState(false);
  const [calendarDate,setCalendarDate]=useState(new Date(2026,7,1));
  const [user,setUser]=useState<any>(null);
  const [academyGraph,setAcademyGraph]=useState<any[]>([]);
  const [selectedGraph,setSelectedGraph]=useState<number | null>(null);
  const [hoverGraph,setHoverGraph]=useState<number | null>(null);
  async function loadAcademyGraph(){

const user_id = localStorage.getItem("user_id");

if(!user_id) return;


const today = new Date();

const dates=[];


for(let i=6;i>=0;i--){

const d=new Date();

d.setDate(today.getDate()-i);


const date =
`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;


dates.push(date);

}



const {data,error}=await supabase
.from("academy_time")
.select("*")
.eq("user_id",user_id)
.in("date",dates);



if(error){
console.log(error);
return;
}



const result=dates.map(date=>{

const item=data?.find(
(x)=>x.date===date
);


return{
date,
minutes:item?.minutes || 0
};

});


setAcademyGraph(result);


}
  
  useEffect(()=>{

const user_id = localStorage.getItem("user_id");


if(!user_id){

router.replace("/login");
return;

}


setUser({
  id:user_id
});


},[router]);
  useEffect(()=>{
    if(!user) return;


    async function loadData(){

      const { data: academyData, error: academyError } = await supabase
  .from("academy_time")
  .select("date")
  .eq("user_id", user.id);

if (!academyError && academyData) {
  setAcademyDates(
    academyData.map(item => item.date)
  );
}


      const {data:eventData,error:eventError}=await supabase
.from("calendar_events")
.select("date")
.eq(
"user_id",
user.id
);


      if(eventError){
        console.log(eventError);
        return;
      }


      setEventDates(
        eventData.map(item=>item.date)
      );



      const {data:examData,error:examError}=await supabase
.from("exam_settings")
.select("*")
.eq(
"user_id",
user.id
)
.single();



      if(examError){
        console.log(examError);
        return;
      }



      if(examData){
  setExamTitle(examData.title || "");
  setExamDate(examData.date || "");
}



    }


    loadData();
    loadAcademyGraph();


  },[user]);




  async function saveTitle(){

  const {data} = await supabase
    .from("exam_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();


  if(data){

    await supabase
      .from("exam_settings")
      .update({
        title:examTitle
      })
      .eq(
        "user_id",
        user.id
      );


  }else{

    await supabase
      .from("exam_settings")
      .insert({
        user_id:user.id,
        title:examTitle,
        date:""
      });

  }


  setEditTitle(false);

}



  async function saveDate(value:string){

  setExamDate(value);


  const {data} = await supabase
    .from("exam_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();



  if(data){

    await supabase
      .from("exam_settings")
      .update({
        date:value
      })
      .eq(
        "user_id",
        user.id
      );


  }else{

    await supabase
      .from("exam_settings")
      .insert({
        user_id:user.id,
        date:value,
        title:"피아노 입시"
      });

  }

}





  const today = new Date();

  const targetDate = new Date(examDate);


  const dDay = Math.ceil(
    (targetDate.getTime()-today.getTime())
    /
    (1000*60*60*24)
  );



  const year = calendarDate.getFullYear();

  const month = calendarDate.getMonth()+1;



  const firstDay =
    new Date(year,month-1,1).getDay();


  const lastDate =
    new Date(year,month,0).getDate();



  const calendarDays=[
    ...Array(firstDay).fill(""),
    ...Array.from(
      {length:lastDate},
      (_,i)=>i+1
    )
  ];





return (
  

<main className="
min-h-screen
bg-[#F7F8FC]
px-5
py-8
text-gray-900
">


<div className="
mx-auto
max-w-md
">



<div className="
flex
justify-between
items-center
">

<h1 className="
text-3xl
font-bold
">
Piano Diary
</h1>


<button

onClick={async()=>{

localStorage.removeItem("user_id");

router.replace("/login");

}}

className="
rounded-xl
bg-white
px-4
py-2
shadow-sm
text-gray-500
"

>
로그아웃
</button>


</div>



<p className="
mt-2
text-gray-400
">

드가자 대학으로

</p>






<div className="
mt-8
rounded-[32px]
bg-[#8CCBFF]
p-7
text-white
shadow-sm
">



{

editTitle ?


<div className="
flex
gap-2
">


<input

value={examTitle}

onChange={(e)=>
setExamTitle(e.target.value)
}

className="
flex-1
rounded-xl
p-2
text-gray-700
"

/>


<button

onClick={saveTitle}

className="
rounded-xl
bg-white
px-3
py-2
text-[#4DA3FF]
font-bold
"

>

저장

</button>


</div>


:


<p

onClick={()=>
setEditTitle(true)
}

className="
cursor-pointer
opacity-80
text-gray-900
font-bold
"

>

📍︎ {examTitle}

</p>


}





<h2 className="
mt-3
text-6xl
font-bold
">

D-{dDay}

</h2>




<button

onClick={()=>setDateOpen(true)}

className="
mt-5
w-full
rounded-2xl
bg-white/90
p-4
text-gray-700
font-bold
text-left
"

>

{examDate.replaceAll("-", ".")}

</button>



</div>






<div className="
mt-10
rounded-[32px]
bg-white
p-6
shadow-sm
">



<div className="
flex
justify-between
items-center
">

<button

onClick={()=>{

setCalendarDate(
new Date(
year,
month-2,
1
)

)

}}

className="
text-2xl
font-bold
"

>

‹

</button>



<h2 className="
text-xl
font-bold
">

{year} 년 {month} 월

</h2>



<button

onClick={()=>{

setCalendarDate(
new Date(
year,
month,
1
)

)

}}

className="
text-2xl
font-bold
"

>

›

</button>


</div>



<div className="
mt-5
grid
grid-cols-7
gap-2
text-center
text-sm
">


{

[
"일",
"월",
"화",
"수",
"목",
"금",
"토",
...calendarDays
].map((day,index)=>{

const currentDate =
typeof day === "number"
?
`${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`
:
"";

return(

<button

key={index}

onClick={()=>{

if(day){

router.push(
`/calendar/${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`
);

}

}}

className="
relative
rounded-xl
p-3
hover:bg-blue-100
"

>


<span
className={`
${
typeof day === "number" &&
year === new Date().getFullYear() &&
month === new Date().getMonth()+1 &&
day === new Date().getDate()

?

"text-[#8CCBFF] font-bold"

:

academyDates.includes(currentDate)

?

"text-gray-300"

:

""

}
`}
>
{day}

</span>



{

typeof day==="number"
&&

eventDates.includes(
`${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`
)

&&


<div

className="
mx-auto
mt-1
h-2
w-2
rounded-full
bg-[#8CCBFF]
"

/>


}



</button>


);
})


}



</div>



</div>


<div className="
mt-8
rounded-[32px]
bg-white
p-6
shadow-sm
">

<h2 className="
font-bold
">
MINUTES
</h2>


<div
className="
mt-6
flex
h-40
items-end
justify-between
gap-2
"
>

{
academyGraph.map((item,index)=>(

<div
key={index}
className="
relative
flex-1
flex
flex-col
items-center
justify-end
group
"
>


{
(selectedGraph === index || hoverGraph === index) &&

<div
className="
absolute
-bottom-8
rounded-lg
bg-black
px-2
py-1
text-xs
text-white
whitespace-nowrap
z-10
"
>
{item.minutes}분
</div>

}


<button

onMouseEnter={()=>
setHoverGraph(index)
}

onMouseLeave={()=>
setHoverGraph(null)
}

onClick={()=>
setSelectedGraph(
selectedGraph === index
?
null
:
index
)
}

className="
w-8
rounded-t-xl
bg-[#8CCBFF]
hover:opacity-80
"

style={{
height:
`${Math.max(item.minutes / 5,8)}px`
}}


/>


<p className="
mt-3
text-[11px]
text-gray-400
"
>

{
String(item.date).slice(5).replace("-",".")
}

</p>



</div>


))
}


</div>

</div>

</div>
{
dateOpen &&

<div

className="
fixed
inset-0
bg-black/30
flex
items-center
justify-center
"

>


<div

className="
rounded-[30px]
bg-white
p-6
w-80
"

>


<h2 className="
text-xl
font-bold
mb-5
">

날짜 선택

</h2>



<input

type="date"

value={examDate}

onChange={(e)=>{

saveDate(e.target.value);
setDateOpen(false);

}}

className="
w-full
rounded-xl
border
p-3
"

/>



<button

onClick={()=>setDateOpen(false)}

className="
mt-4
w-full
rounded-xl
bg-gray-100
p-3
"

>

닫기

</button>


</div>


</div>

}
</main>

);


}