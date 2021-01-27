export class ImageRenderer
{
    constructor(image, imageScale)
    {
		if (typeof imageScale == "undefined") imageScale = 1;
		
		this.image = image;
		this.imageScale = imageScale;
		this.renderedImage = null;
		this.renderedScale = null;
		
		if (this.image.complete && this.image.naturalWidth !== 0)
		{
			this.width = this.image.naturalWidth;
			this.height = this.image.naturalHeight;
		}
		else
		{
			this.width = this.image.width;
			this.height = this.image.height;
		}
	}
	
	getImage(scale)
	{
		if (this.renderedImage != null && this.renderedScale == scale)
			return this.renderedImage;
		
		const renderedImage = document.createElement('canvas');
		
		if (this.image.complete && this.image.naturalHeight !== 0)
		{
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
