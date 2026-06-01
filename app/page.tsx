import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { Events } from "@/lib/constants";

const page = () => {
  return (
    <section>
      <h1 className="text-center">The Hub for Every Dev<br/>Event you Can't Miss</h1>
      <p className="text-center mt-5">Discover, Connect, and Thrive with DevEvents</p>
      <ExploreBtn/>

      <div className="mt-20 space-y-7">
          <h3>Featured Events</h3>
          <ul className="events">
            {Events.map((event,idx)=>(
              <li key={idx}>
                <EventCard {...event}/>
              </li>
            ))}
          </ul>
      </div>
    </section>
    
  )
}

export default page