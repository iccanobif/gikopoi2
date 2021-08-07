export class RenderCache
{
	drawFunction: any
	renderedImage: any
	renderedScale: number | null
	width: number
	height: number

    constructor(drawFunction: any)
    {
		this.drawFunction = drawFunction;
		this.renderedImage = null;
		this.renderedScale = null;
		this.width = 0;
		this.height = 0;
	}
	
	static Image(image: HTMLImageElement, imageScale: number, flipped: boolean = false): RenderCache
	{
		if (typeof imageScale == "undefined") imageScale = 1;
		
		const renderCache = new RenderCache(function(renderedImage: any, scale: number)
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
	
	getImage(scale: number)
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
