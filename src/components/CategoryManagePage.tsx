import { useState } from 'react'
import type { Category } from '../types/item'


export function CategoryManagePage({
  categories,
  onBack,
  onAdd,
  onUpdate,
  onDelete,
}: {
  categories: Category[]
  onBack: () => void
  onAdd: (name:string)=>Promise<Category>
  onUpdate: (id:string,name:string)=>Promise<void>
  onDelete: (id:string)=>Promise<void>
}) {

  const [newName,setNewName] = useState('')


  return (
    <div className="fixed inset-0 z-30 mx-auto flex max-w-lg flex-col bg-paper">


      <div className="relative flex items-center border-b border-line px-4 py-3.5">

        <button
          onClick={onBack}
          className="text-accent-text"
        >
          <img
            src="/icons/back.svg"
            className="h-4"
          />
        </button>


        <span className="absolute left-1/2 -translate-x-1/2 text-base font-medium">
          分类管理
        </span>

      </div>



      <div className="flex-1 overflow-y-auto px-5 pt-5">


        <div className="flex gap-2 mb-5">

          <input
            value={newName}
            onChange={(e)=>setNewName(e.target.value)}
            placeholder="输入新分类"
            className="
              flex-1
              h-10
              rounded-lg
              border
              border-line
              bg-paper-card
              px-3
              text-sm
              outline-none
            "
          />


          <button
            onClick={async()=>{

              const name=newName.trim()

              if(!name)return

              await onAdd(name)

              setNewName('')

            }}
            className="
              rounded-lg
              bg-accent
              px-4
              text-sm
              text-on-accent
            "
          >
            添加
          </button>

        </div>




        <div className="divide-y divide-line border-y border-line">

        {
          categories.map((c)=>(
            
            <CategoryRow
              key={c.id}
              category={c}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />

          ))
        }


        </div>


      </div>


    </div>
  )
}





function CategoryRow({
 category,
 onUpdate,
 onDelete
}:{
 category:Category
 onUpdate:(id:string,name:string)=>Promise<void>
 onDelete:(id:string)=>Promise<void>
}){


 const [edit,setEdit]=useState(false)
 const [name,setName]=useState(category.name)


 return (

<div className="flex items-center justify-between py-3">


{
edit?

<input
value={name}
onChange={e=>setName(e.target.value)}
className="
border
rounded
px-2
h-8
text-sm
"
/>

:

<span className="text-sm">
{category.name}
</span>

}



<div className="flex gap-3 text-xs text-ink-faint">


<button

onClick={async()=>{

if(edit){

await onUpdate(category.id,name)

}

setEdit(!edit)

}}

>
{edit?'保存':'编辑'}
</button>



<button
onClick={()=>onDelete(category.id)}
>
删除
</button>


</div>


</div>

 )

}