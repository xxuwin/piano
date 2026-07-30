"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";


export default function CalendarDetailPage({
  params,
}: {
  params: Promise<{date:string}>
}) {


  const router = useRouter();
  const {date}=use(params);


  const [records,setRecords]=useState<any[]>([]);
  const [items,setItems]=useState<any[]>([]);


  const [open,setOpen]=useState(false);
  const [selectedRecord,setSelectedRecord]=useState<any>(null);


  const [tempo,setTempo]=useState(80);
  const [memo,setMemo]=useState("");
  const [events,setEvents]=useState<any[]>([]);

const [eventOpen,setEventOpen]=useState(false);

const [eventTitle,setEventTitle]=useState("");

const [eventTime,setEventTime]=useState("12:00");
const [academyOpen,setAcademyOpen]=useState(false);

const [startTime,setStartTime]=useState("14:00");

const [endTime,setEndTime]=useState("18:00");

const [academyTime,setAcademyTime]=useState<any>(null);
const [academyData,setAcademyData]=useState<any>(null);
const [user,setUser]=useState<any>(null);

const eventTimes =
Array.from(
  {length:144},
  (_,i)=>{

    const hour =
      Math.floor(i/6);

    const minute =
      (i%6)*10;


    return `${String(hour).padStart(2,"0")}:${String(minute).padStart(2,"0")}`;

  }
);

  const tempos =
    Array.from(
      {length:29},
      (_,i)=>40+i*5
    );




  useEffect(()=>{

const user_id = localStorage.getItem("user_id");


if(!user_id){

router.replace("/login");
return;

}


setUser({
  id:user_id
});


},[]);


useEffect(()=>{

  if(!user) return;

  loadRecords();
  loadEvents();
  loadAcademyTime();

},[date,user]);




  async function loadRecords(){


    const {data,error}=await supabase
      .from("project_save")
      .select("*")
      .eq("date",date)
      .eq("user_id",user.id)
    


    if(error){

      console.log(error);
      return;

    }


    setRecords(data||[]);



    if(data){

      loadItems(data);

    }

  }

async function loadEvents(){

  const {data,error}=await supabase
    .from("calendar_events")
    .select("*")
    .eq("date",date)
    .eq("user_id",user.id)
   


  if(error){

    console.log(error);
    return;

  }


  setEvents(data||[]);

}

async function loadAcademyTime(){

  const {data,error}=await supabase
    .from("academy_time")
    .select("*")
    .eq("date",date)
    .eq("user_id",user.id)
    .limit(1)
    .maybeSingle();


  if(error){

    console.log(error);
    setAcademyData(null);
    return;

  }


  setAcademyData(data);

  if(data){
    setAcademyTime(data.minutes);
  }else{
    setAcademyTime(null);
  }

}

  async function loadItems(records:any[]){


    const ids=records.map(
      item=>item.id
    );


    if(ids.length===0){

      setItems([]);
      return;

    }



    const {data,error}=await supabase
  .from("practice_items")
  .select("*")
  .in(
    "record_id",
    ids
  )
  .eq(
    "user_id",
    user.id
  );



    if(error){

      console.log(error);
      return;

    }


    setItems(data||[]);


  }







  async function addSong(){


    const song =
      prompt("곡 이름");


    if(!song)return;



    await supabase
      .from("project_save")
      .insert({

        date,
        song,
        tempo:80,
        progress:0,
        memo:"",
        user_id:user.id

      });



    loadRecords();

  }
async function saveAcademyTime(){

  const start =
  new Date(`2026-01-01T${startTime}`);

  const end =
  new Date(`2026-01-01T${endTime}`);


  const diff =
  (end.getTime()-start.getTime())
  /
  (1000*60);



  const {error}=await supabase
  .from("academy_time")
  .upsert(
    {
      date,

      start_time:startTime,

      end_time:endTime,

      minutes:diff,

      user_id:user.id

    },
    {
      onConflict:"date,user_id"
    }
  );



  if(error){

    alert(error.message);
    return;

  }


  setAcademyTime(diff);

  setAcademyOpen(false);

  loadAcademyTime();

}

async function addEvent(){

  if(!eventTitle)return;


  const {error}=await supabase
    .from("calendar_events")
    .insert({

      date,
      title:eventTitle,
      time:eventTime,
      user_id:user.id

    });


  if(error){

    alert(error.message);
    return;

  }


  setEventTitle("");
  setEventTime("12:00");
  setEventOpen(false);

  loadEvents();

}

async function deleteEvent(id:string){

  const {error}=await supabase
    .from("calendar_events")
    .delete()
    .eq(
      "id",
      id
    ).eq("user_id",user.id);


  if(error){

    alert(error.message);
    return;

  }


  setEvents(prev =>
    prev.filter(
      event=>event.id!==id
    )
  );

}


  async function addPractice(){


    if(!selectedRecord)
      return;



    const {error}=await supabase
      .from("practice_items")
      .insert({

        record_id:selectedRecord.id,

        title:"",

        tempo,

        progress:0,

        memo,
        user_id:user.id

      });



    if(error){

      alert(error.message);
      return;

    }


    setOpen(false);
    setMemo("");
    setTempo(80);


    loadRecords();


  }







  async function updateItem(
    id:string,
    key:string,
    value:any
  ){


    const { error } = await supabase
  .from("practice_items")
  .update({
    [key]: value,
  })
  .eq("id", id)
  .eq("user_id", user.id);

if (error) {
  alert(error.message);
  return;
}

setItems((prev) =>
  prev.map((item) =>
    item.id === id
      ? { ...item, [key]: value }
      : item
  )
);


  }


async function deleteItem(id:string){

  const {error}=await supabase
    .from("practice_items")
    .delete()
    .eq(
      "id",
      id
    ).eq(
  "user_id",
  user.id
);


  if(error){

    alert(error.message);
    return;

  }


  setItems(prev=>
    prev.filter(
      item=>item.id!==id
    )
  );

}

async function deleteSong(id:string){
await supabase
  .from("practice_items")
  .delete()
  .eq("record_id", id)
  .eq("user_id", user.id);
  const {error}=await supabase
    .from("project_save")
    .delete()
    .eq(
      "id",
      id
    ).eq(
  "user_id",
  user.id
);


  if(error){

    alert(error.message);
    return;

  }


  setRecords(prev =>
    prev.filter(
      record => record.id !== id
    )
  );


  setItems(prev =>
    prev.filter(
      item => item.record_id !== id
    )
  );

}

return(

<main className="
min-h-screen
bg-[#F7F8FC]
p-6
text-black
">


<div className="
mx-auto
max-w-md
">



<button

onClick={()=>router.push("/")}

className="
rounded-2xl
bg-white
px-4
py-2
shadow
"

>
←
</button>



<h1 className="
mt-6
text-3xl
font-bold
">

📅 {date}

</h1>
<div className="
mt-6
rounded-3xl
bg-white
p-5
shadow-sm
">


<h2 className="
font-bold
">

🎹 학원 시간

</h2>


{
academyData && academyTime !== null ?

<div
onClick={()=>{

setStartTime(academyData.start_time);
setEndTime(academyData.end_time);
setAcademyOpen(true);

}}

className="
mt-3
font-bold
text-[#4DA3FF]
"

>

<div>

<p>
⏱ {academyData.start_time} ~ {academyData.end_time}
</p>
<button
onClick={async()=>{

const {error}=await supabase
.from("academy_time")
.delete()
.eq("id", academyData.id)
.eq("user_id", user.id);


if(error){
  alert(error.message);
  return;
}


setAcademyData(null);
setAcademyTime(null);
loadAcademyTime();
}}
className="
mt-3
text-sm
text-red-400
"
>
×
</button>

<p className="
mt-2
text-sm
text-gray-400
">

{Math.floor(academyData.minutes / 60)} 시간{" "}
{academyData.minutes % 60} 분

</p>

</div>

</div>

:

<button

onClick={()=>setAcademyOpen(true)}

className="
mt-3
w-full
rounded-xl
bg-[#EEF8FF]
p-3
font-bold
text-[#4DA3FF]
"

>

＋ 학원 시간 입력

</button>

}



</div>
<div className="mt-6 space-y-3">

<h2 className="font-bold">
📌 일정
</h2>


{
events.map(event=>(

<div
key={event.id}
className="
rounded-2xl
bg-white
p-4
shadow-sm
"
>

<div className="
flex
justify-between
items-center
">

<p className="font-bold">
{event.title}
</p>


<button

onClick={()=>deleteEvent(event.id)}

className="
h-7
w-7
rounded-full
bg-gray-100
text-gray-400
text-lg
"

>
×
</button>


</div>


<p className="
mt-2
text-sm
text-gray-400
">

{event.time}

</p>


</div>

))
}

</div>
<div className="mt-6">

<button

onClick={()=>setEventOpen(true)}


className="
w-full
rounded-3xl
bg-white
p-5
shadow-sm
font-bold
text-[#4DA3FF]
"

>

＋ 일정 추가

</button>

</div>



<div className="
mt-8
space-y-5
">



{
records.map(record=>(


<div

key={record.id}

className="
rounded-[30px]
bg-white
p-6
shadow-sm
"

>


<div>

  <div className="
  flex
  justify-between
  items-center
  ">

    <h2 className="
    text-xl
    font-bold
    ">
      🎼 {record.song}
    </h2>


    <button

    onClick={()=>deleteSong(record.id)}

    className="
    h-7
    w-7
    rounded-full
    bg-gray-100
    text-gray-400
    text-lg
    leading-none
    "

    >
      ×
    </button>

  </div>


  <div className="mt-5">

    <div
      className="
      h-3
      w-full
      rounded-full
      bg-gray-200
      overflow-hidden
      "
    >

      <div

        className="
        h-full
        rounded-full
        bg-[#8CCBFF]
        transition-all
        duration-500
        "

        style={{
          width:
          `${
            Math.round(
              (
                items
                .filter(
                  item=>item.record_id===record.id
                )
                .reduce(
                  (sum,item)=>sum+item.progress,
                  0
                )
                /
                (
                  items.filter(
                    item=>item.record_id===record.id
                  ).length || 1
                )
                /
                10
              )*100
            )
          }%`
        }}

      />

    </div>

  </div>


</div>





<div className="
mt-5
space-y-4
">


{

items
.filter(
item=>item.record_id===record.id
)
.map(item=>(


<div

key={item.id}

className="
rounded-2xl
bg-[#F7F8FC]
p-4
"

>


<div className="
flex
justify-between
items-center
">

<p className="
font-bold
">

♩={item.tempo}

</p>


<button

onClick={()=>deleteItem(item.id)}

className="
h-7
w-7
rounded-full
bg-gray-100
text-gray-400
text-lg
leading-none
"

>
×
</button>


</div>





<div className="
mt-3
flex
gap-1
">


{

Array.from({length:10})
.map((_,i)=>(


<button

key={i}

onClick={()=>{

updateItem(
  item.id,
  "progress",
  item.progress === i+1 ? 0 : i+1
)

}}

className={

i < item.progress

?
"h-5 w-5 rounded-md bg-[#8CCBFF]"
:
"h-5 w-5 rounded-md bg-gray-200"

}


/>


))

}


</div>




</div>


))


}



</div>







<button

onClick={()=>{

setSelectedRecord(record);
setOpen(true);

}}

className="
mt-5
w-full
rounded-2xl
bg-[#EEF8FF]
p-4
text-[#4DA3FF]
font-bold
"

>

＋ 연습 기록 추가

</button>






</div>


))

}



</div>







<button

onClick={addSong}

className="
mt-8
w-full
rounded-3xl
bg-[#8CCBFF]
p-5
font-bold
text-white
"

>

＋ 곡 추가

</button>



{
academyOpen &&

<div className="
fixed
inset-0
bg-black/30
flex
items-end
">


<div className="
w-full
rounded-t-[35px]
bg-white
p-7
">


<h2 className="
text-xl
font-bold
">

🎹 학원 시간 입력

</h2>


<p className="mt-5 text-sm text-gray-400">
도착 시간
</p>


<select

value={startTime}

onChange={(e)=>
setStartTime(e.target.value)
}

className="
mt-2
w-full
rounded-xl
border
p-3
"

>

{
eventTimes.map(time=>(

<option
key={time}
value={time}
>
{time}
</option>

))
}

</select>



<p className="mt-4 text-sm text-gray-400">
귀가 시간
</p>


<select

value={endTime}

onChange={(e)=>
setEndTime(e.target.value)
}

className="
mt-2
w-full
rounded-xl
border
p-3
"

>

{
eventTimes.map(time=>(

<option
key={time}
value={time}
>
{time}
</option>

))
}

</select>



<button

onClick={saveAcademyTime}

className="
mt-5
w-full
rounded-xl
bg-[#8CCBFF]
p-4
text-white
font-bold
"

>

저장

</button>


</div>

</div>

}



{

eventOpen &&

<div className="
fixed
inset-0
bg-black/30
flex
items-end
">


<div className="
relative
w-full
rounded-t-[35px]
bg-white
p-7
">


<h2 className="
text-xl
font-bold
">

일정 추가

</h2>
<button

onClick={()=>setEventOpen(false)}

className="
absolute
right-7
top-7
h-8
w-8
rounded-full
bg-gray-100
text-gray-500
text-xl
"

>
×
</button>

<input

value={eventTitle}

onChange={(e)=>
setEventTitle(e.target.value)
}

placeholder="일정 제목"

className="
mt-5
w-full
rounded-xl
border
p-3
"

/>

<div
className="
mt-4
h-40
overflow-y-scroll
rounded-xl
border
text-center
"
>

{
eventTimes.map(time=>(

<button

key={time}

onClick={()=>setEventTime(time)}

className={`
block
w-full
py-3

${
eventTime===time
?
"font-bold text-[#4DA3FF]"
:
"text-gray-400"
}

`}

>

{time}

</button>

))
}

</div>


<button

onClick={addEvent}

className="
mt-4
w-full
rounded-xl
bg-[#8CCBFF]
p-4
text-white
font-bold
"

>

추가

</button>


</div>


</div>

}

{

open &&

<div className="
fixed
inset-0
bg-black/30
flex
items-end
">


<div className="
w-full
rounded-t-[35px]
bg-white
p-7
">


<div className="
flex
justify-between
items-center
">

<h2 className="
text-xl
font-bold
">
연습 기록 추가
</h2>


<button

onClick={()=>{

setOpen(false);
setMemo("");
setTempo(80);

}}

className="
h-8
w-8
rounded-full
bg-gray-100
text-gray-500
text-xl
"

>

×


</button>


</div>




<p className="
mt-5
text-sm
text-gray-400
">

목표 템포

</p>


<select

value={tempo}

onChange={(e)=>
setTempo(
Number(e.target.value)
)
}

className="
mt-2
w-full
rounded-xl
border
p-3
"

>


{

tempos.map(t=>(


<option

key={t}

value={t}

>

♩={t}

</option>


))

}


</select>





<textarea

value={memo}

onChange={(e)=>
setMemo(e.target.value)
}

placeholder="연습 메모"

className="
mt-4
w-full
rounded-xl
border
p-3
"

/>




<button

onClick={addPractice}

className="
mt-4
w-full
rounded-xl
bg-[#8CCBFF]
p-4
text-white
font-bold
"

>

추가

</button>




</div>


</div>


}



</div>

</main>

);


}