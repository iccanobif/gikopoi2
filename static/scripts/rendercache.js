export class RenderCache
{
    constructor(drawFunction)
    {
        this.drawFunction = drawFunction;
        this.renderedImage = null;
        this.renderedScale = null;
        this.width = 1
        this.height = 1 
        this.cropX = 0
        this.cropY = 0
        this.cropWidth = 1
        this.cropHeight = 1
    }
    
    static Image(image, imageScale, flipped)
    {
        if (typeof imageScale == "undefined") imageScale = 1;
        if (typeof flipped == "undefined") flipped = false;
        
        const renderCache = new RenderCache(function(renderedImage, scale)
        {
            if (!image.complete ||
                image.naturalHeight === 0) return false;
            
            const width = image.naturalWidth * imageScale
            const height = image.naturalHeight * imageScale
            
            const renderedWidth = width * scale
            const renderedHeight = height * scale
            
            const renderedBoxWidth = Math.ceil(renderedWidth)
            const renderedBoxHeight = Math.ceil(renderedHeight)
            
            renderedImage.width = renderedBoxWidth;
            renderedImage.height = renderedBoxHeight;
            
            const context = renderedImage.getContext('2d');
            
            let x = 0;
            if (flipped)
            {
                context.scale(-1, 1);
                x = -renderedWidth;
            }
            
            context.drawImage(image, x, 0, renderedWidth, renderedHeight);
            
            var imgData = context.getImageData(0,0,renderedBoxWidth,renderedBoxHeight)
            const totalPixels = renderedBoxWidth * renderedBoxHeight
            
            const readPixel = (index) =>
            {
                const pi = index * 4
                return {
                    x: index % renderedBoxWidth,
                    y: Math.floor(index / renderedBoxWidth),
                    color: imgData.data.slice(pi, pi+4)
                }
            }
            
            let cropX = null // left
            let cropY = null // top
            let cropXRight = 0
            let cropYBottom = 0
            for (let i=0; i<totalPixels; i++)
            {
                const pixel = readPixel(i)
                if (pixel.color[3] == 0) continue
                
                if (cropY == null) cropY = pixel.y
                cropYBottom = pixel.y
                cropX = cropX ? Math.min(cropX, pixel.x) : pixel.x
                cropXRight = Math.max(cropXRight, pixel.x)
            }
            if (cropY == null) cropY = 0
            if (cropX == null) cropX = 0
            
            const cropWidth = 1 + (cropXRight - cropX)
            const cropHeight = 1 + (cropYBottom - cropY)
            
            return { width, height,
                cropX, cropY, cropWidth, cropHeight }
        })
        
        return renderCache;
    }
    
    getImage(scale)
    {
        if (typeof scale == "undefined") scale = 1;
        if (this.renderedImage != null && this.renderedScale == scale)
            return this.renderedImage;
        
        const renderedImage = document.createElement('canvas');
        
        const dims = this.drawFunction.call(this, renderedImage, scale)
        if (dims)
        {
            this.renderedImage = renderedImage;
            this.renderedScale = scale;
            Object.entries(dims).forEach(([key, value]) => this[key] = value)
            if (this.width > this.cropWidth)
            {
                this.cropWidth = this.width
                this.cropHeight = this.height
            }
        }
        else
        {
            renderedImage.width = 1;
            renderedImage.height = 1;
        }
        
        return renderedImage;
    }
}
