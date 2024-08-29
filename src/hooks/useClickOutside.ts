import { useEffect } from "react";

type RefType = React.RefObject<HTMLElement>;
type SetStateType = React.Dispatch<React.SetStateAction<boolean>>;

const useClickOutsideForImages = (refs: RefType[], setOpen: SetStateType) => {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
        console.log(refs);
        
      if (
        refs.every(
          (ref) => ref.current && !ref.current.contains(event.target as Node)
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [refs, setOpen]);
};

export { useClickOutsideForImages };
