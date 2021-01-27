export class RenderCache
{
    constructor(drawFunction)
    {
		this.drawFunction = drawFunction;
		this.renderedImage = null;
		this.renderedScale = null;
	}
	
	static Image(image, imageScale)
	{
		if (typeof imageScale == "undefined") imageScale = 1;
		
		const renderCache = new RenderCache(function(scale)
		{
			if (!this.image.complete ||
				this.image.naturalHeight === 0) return null;
			
			const renderedImage = document.createElement('canvas');
			
			if (this.width == 0)
			{
				this.width = this.image.naturalWidth;
				this.height = this.image.naturalHeight;
			}
			const scaledWidth = this.width * this.imageScale * scale;
			const scaledHeight = this.height * this.imageScale * scale;
			
			renderedImage.width = Math.ceil(scaledWidth);
			renderedImage.height = Math.ceil(scaledHeight);
			
			renderedImage.getContext('2d').drawImage(this.image,
				0, 0, scaledWidth, scaledHeight);
			return renderedImage;
		})
		
		renderCache.image = image;
		renderCache.imageScale = imageScale;
		
		if (image.complete && image.naturalWidth !== 0)
		{
			renderCache.width = image.naturalWidth;
			renderCache.height = image.naturalHeight;
		}
		else
		{
			renderCache.width = image.width;
			renderCache.height = image.height;
		}
		return renderCache;
	}
	
	getImage(scale)
	{
		if (this.renderedImage != null && this.renderedScale == scale)
			return this.renderedImage;
		
		const renderedImage = this.drawFunction.call(this, scale)
		
		if (renderedImage)
		{
			this.renderedImage = renderedImage;
			this.renderedScale = scale;
		}
		else
		{
			const renderedImage = document.createElement('canvas');
			renderedImage.width = 1;
			renderedImage.height = 1;
		}
		
		return renderedImage;
	}
}
