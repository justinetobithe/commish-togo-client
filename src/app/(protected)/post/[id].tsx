import { useParams } from 'next/navigation';
import React from 'react';

export default function PostDetailsPage() {
    const params = useParams();
    const id = params?.id;

    return (
        <div>Post ID: {id}</div>
    );
}
