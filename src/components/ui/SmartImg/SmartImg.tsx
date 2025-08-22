import React, {useState} from 'react'

interface SmartImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  InitialImage: string; // импорт картинки = строка
  HoverImage: string;
}

const SmartImg = ({InitialImage, HoverImage, ...props} : SmartImgProps) => {
    const [onHover, setHover] = useState(false)
    return (
    <img src={onHover ? HoverImage : InitialImage} {...props}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
        
    </img>
  )
}

export default SmartImg