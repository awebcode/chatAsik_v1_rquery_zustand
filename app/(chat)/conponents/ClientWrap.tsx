"use client"

import React, { ReactNode } from 'react'

const ClientWrap = ({ children }: { children:ReactNode }) => {
    return <div>{children}</div>;
};

export default ClientWrap