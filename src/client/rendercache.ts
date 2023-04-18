export type DrawFunction = (renderedImage: HTMLCanvasElement, scale: number) => [number, number] | false

export class RenderCache
{
    private drawFunction: DrawFunction
    public renderedImage: HTMLCanvasElement | null = null
    public renderedScale: number | null = null
    public width: number = 0
    public height: number = 0
    
    constructor(drawFunction: DrawFunction)
    {
        this.drawFunction = drawFunction;
    }
    
    static Image(image: HTMLImageElement, imageScale: number = 1, flipped: boolean = false)
    {
        const renderCache = new RenderCache((renderedImage, scale) =>
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
            if (!context) return false
            
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
    
    getImage(scale: number = 1)
    {
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
