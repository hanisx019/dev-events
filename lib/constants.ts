export interface Props{
    title:string;
    image:string;
    slug:string;
    location:string;
    date:string;
    time:string;
}

export const Events:Props[] = [
  { image: '/images/event1.png', title: 'Event 1', slug: 'event-1', location: 'Mumbai, Maharashtra', date: '15 June 2026', time: '10:00 AM' },
  { image: '/images/event2.png', title: 'Event 2', slug: 'event-2', location: 'Pune, Maharashtra', date: '20 June 2026', time: '2:00 PM' },
  { image: '/images/event3.png', title: 'Event 3', slug: 'event-3', location: 'Bengaluru, Karnataka', date: '25 June 2026', time: '11:30 AM' },
  { image: '/images/event4.png', title: 'Event 4', slug: 'event-4', location: 'Hyderabad, Telangana', date: '30 June 2026', time: '5:00 PM' },
  { image: '/images/event5.png', title: 'Event 5', slug: 'event-5', location: 'Delhi, India', date: '5 July 2026', time: '9:00 AM' },
  { image: '/images/event6.png', title: 'Event 6', slug: 'event-6', location: 'Chennai, Tamil Nadu', date: '10 July 2026', time: '6:30 PM' },
];
