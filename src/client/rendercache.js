export class RenderCache
{
    constructor(drawFunction)
    {
        this.drawFunction = drawFunction;
        this.renderedImage = null;
        this.renderedScale = null;
        this.width = 0;
        this.height = 0;
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
            const height = image.naturalHeight * imageScale;
            
            const scaledWidth = width * scale;
            const scaledHeight = height * scale;
            
            renderedImage.width = Math.ceil(scaledWidth);
            renderedImage.height = Math.ceil(scaledHeight);
            
            const context = renderedImage.getContext('2d');
            
            let x = 0;
            if (flipped)
            {
                context.scale(-1, 1);
                x = -scaledWidth;
            }
            
            context.drawImage(image, x, 0, scaledWidth, scaledHeight);
            
            return [width, height];
        })
        
        return renderCache;
    }
    
    getImage(scale)
    {
        if (typeof scale == "undefined") scale = 1;
        if (this.renderedImage != null && this.renderedScale == scale)
            return this.renderedImage;
        
        const renderedImage = document.createElement('canvas');
        
        const dimensions = this.drawFunction.call(this, renderedImage, scale)
        if (dimensions)
        {
            this.renderedImage = renderedImage;
            this.renderedScale = scale;
            this.width = dimensions[0];
            this.height = dimensions[1];
        }
        else
        {
            renderedImage.width = 1;
            renderedImage.height = 1;
        }
        
        return renderedImage;
    }
}
