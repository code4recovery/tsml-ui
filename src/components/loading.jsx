import React from 'react';

export default function Loading() {
  return (
    <div className="d-flex h-100 flex-grow-1 align-items-center justify-content-center loading">
      <div className="spinner-border text-secondary m-5" />
    </div>
  );
}
