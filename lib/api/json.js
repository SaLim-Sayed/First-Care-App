import { NextResponse } from 'next/server';

export function jsonOk(data, init) {
  return NextResponse.json(data, init);
}

export function jsonError(status, data) {
  return NextResponse.json(data, { status });
}
