export class ImageRenderer
{
    constructor(image, frameDuration, imageScale)
    {
		if (!Array.isArray(image))
			image = [image]
		if (typeof imageScale == "undefined") imageScale = 1;
		if (typeof frameDuration == "undefined") frameDuration = 1000;
		
		this.frames = image;
		this.imageScale = imageScale;
		this.frameDuration = frameDuration;
		
		this.renderedFrames = this.frames.map(() => null);
		this.start = null;
		
		if (this.frames[0].complete && this.frames[0].naturalWidth !== 0)
		{
			this.width = this.frames[0].naturalWidth;
			this.height = this.frames[0].naturalHeight;
		}
		else
		{
			this.width = this.frames[0].width;
			this.height = this.frames[0].height;
		}
	}
	
	getImage(scale)
	{
		if (typeof scale == "undefined") scale = 1;
		if (this.frames.length == 1)
			return this._getRenderedFrame(0, scale);
		
		if (this.start == null)
			this.start = Date.now();
		
		const diff = Date.now() - this.start;
		
		const index = Math.floor(diff / this.frameDuration) % this.frames.length;
		return this._getRenderedFrame(index, scale);
	}
	
	prerenderImage(scale)
	{
		if (typeof scale == "undefined") scale = 1;
		for (const i=0; i<this.frames.length; i++)
		{
			this._getRenderedFrame(i, scale)
		}
	}
	
	resetFrameCycle()
	{
		this.start = null;
	}
	
	_getRenderedFrame(frameIndex, scale)
	{
		if (this.renderedFrames[frameIndex] != null &&
			this.renderedFrames[frameIndex][1] == scale)
		{
			return this.renderedFrames[frameIndex][0];
		}
		
		const renderedFrame = document.createElement('canvas');
		
		const frame = this.frames[frameIndex];
		
		if (frame.complete && frame.naturalHeight !== 0)
		{
			if (this.width == 0)
			{
				this.width = frame.naturalWidth;
				this.height = frame.naturalHeight;
			}
			const scaledWidth = frame.naturalWidth * this.imageScale * scale;
			const scaledHeight = frame.naturalHeight * this.imageScale * scale;
			
			
			renderedFrame.width = Math.ceil(scaledWidth);
			renderedFrame.height = Math.ceil(scaledHeight);
			
			renderedFrame.getContext('2d').drawImage(frame, 0, 0, scaledWidth, scaledHeight);
			this.renderedFrames[frameIndex] = [renderedFrame, scale];
		}
		else
		{
			console.log("here for some reason")
			renderedFrame.width = 1;
			renderedFrame.height = 1;
		}
		return renderedFrame;
	}
}
