import { useEffect } from "react";

type RefType = React.RefObject<HTMLElement>;
type SetStateType = React.Dispatch<React.SetStateAction<boolean>>;

const useClickOutsideForImages = (
  refs: RefType[],
  active: boolean,
  setOpen: SetStateType
) => {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        refs.every(
          (ref) => ref.current && !ref.current.contains(event.target as Node)
        ) &&
        active
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [refs, setOpen]);
};

export { useClickOutsideForImages };
