import React, { FC } from 'react';

const TopBar: FC<{}> = () => {
  const buttonStyle = {
    border: '1px solid grey',
    borderRadius: '4px',
    padding: '0.5rem',
  };
  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 10000000,
        width: '100%',
        backgroundColor: '#fff',
        padding: '1rem',
      }}
    >
      <button id="sendFirstMessage" style={buttonStyle}>
        send first message
      </button>
      <button
        id="sendSecondMessage"
        style={{ ...buttonStyle, marginLeft: '1rem' }}
      >
        send second message
      </button>
    </div>
  );
};

export default TopBar;
