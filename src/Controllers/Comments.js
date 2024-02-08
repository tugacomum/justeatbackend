import Comments from "../Models/Comments";

export async function GetRestaurantComments(req, res) {
    const restaurantId = req.body.restaurantId;

    try {
        const comments = await Comments.find({ restaurantId }).populate('userId', 'nome').sort({ createdAt: -1 });
        if (!comments) {
            return res.status(200).json({ message: 'No comments found' });
        }
        return res.status(200).json(comments);
    } catch (error) {
        return res.status(400).json({ message: 'Something went wrong' });
    }  
}

export async function GetComments(req, res) {
    try {
        const comments = await Comments.find({});
        res.send(comments);
    } catch (error) {
        return res.status(400).json({ message: 'Something went wrong' });
    }
}

export async function PostRestaurantComments(req, res) {
    const params = req.body;

    if (!params.rating) {
        return res.status(400).json({ message: 'Rating is required.' });
    }

    try {
        const newComment = new Comments({
            ...params
        });

        await newComment.save();
        return res.status(201).json({ message: 'Comment added successfully' });
    } catch (error) {
        return res.status(400).json({ message: 'Something went wrong' });
    }
}