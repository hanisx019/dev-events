import { connectDB } from "@/lib/mongodb";
import { NextRequest , NextResponse} from "next/server";
import { Event }  from "@/database/event.model";


export async function POST(req:NextRequest){
    try{
        await connectDB();

        const formData=await req.formData();

        let event: Record<string, FormDataEntryValue>;

        try{
            event = Object.fromEntries(formData.entries()) as Record<string, FormDataEntryValue>;
        }catch{
            return NextResponse.json({message:'Invalid JSON Data format'},{status:400})
        }

        const createEvent = await Event.create(event);
        return NextResponse.json({message:'Event Created Successfully',event:createEvent},{status:201})

    }catch(e){
        return NextResponse.json({message:'Event Creation Failed',error:e instanceof Error? e.message:'Unknown'},{status:500})
    }
}
