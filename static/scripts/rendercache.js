export class RenderCache
{
    constructor(drawFunction)
    {
		this.drawFunction = drawFunction;
		this.renderedImage = null;
		this.renderedScale = null;
	}
	
	static Image(image, imageScale, flipped)
	{
		if (typeof imageScale == "undefined") imageScale = 1;
		if (typeof flipped == "undefined") flipped = false;
		
		const renderCache = new RenderCache(function(renderedImage, scale)
		{
			if (!image.complete ||
				image.naturalHeight === 0) return false;
			
			const scaledWidth = image.naturalWidth * imageScale * scale;
			const scaledHeight = image.naturalHeight * imageScale * scale;
			
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
            
			return true;
		})
		
		return renderCache;
	}
	
	getImage(scale)
	{
		if (typeof scale == "undefined") scale = 1;
		if (this.renderedImage != null && this.renderedScale == scale)
			return this.renderedImage;
		
		const renderedImage = document.createElement('canvas');
		if (this.drawFunction.call(this, renderedImage, scale) != false)
		{
			this.renderedImage = renderedImage;
			this.renderedScale = scale;
		}
		else
		{
			renderedImage.width = 1;
			renderedImage.height = 1;
		}
		
		return renderedImage;
	}
}
