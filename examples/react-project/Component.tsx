import React from 'react';

export const MyComponent = () => {
    const items = [1, 2, 3];

    return (
        <div>
            {/* noArrayIndexKey warning */}
            {items.map((item, index) => (
                <div key={index}>{item}</div>
            ))}

            {/* noUselessFragments error */}
            <>
                <span>Hello</span>
            </>

            {/* useAltText error */}
            <img src="https://example.com/image.png" />

            {/* useButtonType error */}
            <button onclick={() => alert('clicked')}>Click me</button>
        </div>
    );
};
