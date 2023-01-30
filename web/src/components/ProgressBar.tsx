import * as Progress from "@radix-ui/react-progress";
import { useState, useEffect } from "react";


interface Props {
  progress: number;
  // isAnimating: boolean;
}

export function ProgressBar({ progress }: Props) {


  return (
    <Progress.Root className="h-3 rounded-xl bg-zinc-700 w-full mt-4" value={progress > 100 ? 100 : progress}>
      <Progress.Indicator
        className={`h-3 rounded-xl bg-violet-600 transition-all duration-300 ease-in-out overflow-hidden`}
        style={{
          width: `${progress > 100 ? 100 : progress}%`,
        }}
      />
    </Progress.Root>
  )
}
