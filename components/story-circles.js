// import Image from "next/image"
// import Link from "next/link"

export default function StoryCircles(
  //{ stories }
  ) {
  return (
    <div className="mt-8 flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {/* {stories.map((story) => (
        <Link key={story.id} href="#" className="flex flex-col items-center gap-1">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full ring-2 ring-primary p-0.5 flex items-center justify-center">
            <div className="relative w-full h-full rounded-full overflow-hidden">
              <Image src={story.image || "/placeholder.svg"} alt={story.title} fill className="object-cover" />
            </div>
          </div>
          <span className="text-xs">{story.title}</span>
        </Link>
      ))} */}
    </div>
  )
}

