import Color from "@/settings/Color";
import Text from "@/settings/Text";
import Dimensions from "@/settings/Dimensions";
import Export from "@/settings/Export";
import { RightSidebarProps } from "@/types/type";
import { useRef } from "react";
import { modifyShape } from "@/lib/shapes";

export default function TranslatorRightSidebar({
  elementAttributes,
  setElementAttributes,
  fabricRef,
  activeObjectRef,
  isEditingRef,
}: RightSidebarProps) {
  const colorInputRef = useRef(null);
  const strokeInputRef = useRef(null);

  const handleInputChange = (property: string, value: string) => {
    if (!isEditingRef.current) isEditingRef.current = true;

    setElementAttributes((prev) => ({ ...prev, [property]: value }));

    modifyShape({
      canvas: fabricRef.current as fabric.Canvas,
      property,
      value,
      activeObjectRef,
    });
  };
  return (
    <div className="bg-white dark:bg-[#2C2C2C] hidden border-r bg-muted/40 md:block w-full h-full flex-col select-none">
      <h3 className=" px-5 pt-4 text-xs uppercase">Design</h3>
      <span className="text-xs mt-3 px-5  pb-4">
        Make changes to canvas as you like
      </span>
      <Dimensions
        isEditingRef={isEditingRef}
        width={elementAttributes.width}
        height={elementAttributes.height}
        handleInputChange={handleInputChange}
      />

      <Text
        fontFamily={elementAttributes.fontFamily}
        fontSize={elementAttributes.fontSize}
        fontWeight={elementAttributes.fontWeight}
        handleInputChange={handleInputChange}
      />

      <Color
        inputRef={colorInputRef}
        attribute={elementAttributes.fill}
        placeholder="color"
        attributeType="fill"
        handleInputChange={handleInputChange}
      />

      <Color
        inputRef={strokeInputRef}
        attribute={elementAttributes.stroke}
        placeholder="stroke"
        attributeType="stroke"
        handleInputChange={handleInputChange}
      />

      <Export />
    </div>
  );
}
