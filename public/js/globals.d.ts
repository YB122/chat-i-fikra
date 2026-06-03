interface Socket {
  on(event: string, callback: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): void;
  disconnect(): void;
  id: string;
}

declare function io(url?: string): Socket;

interface SwalOptions {
  icon?: string;
  title?: string;
  text?: string;
  showCancelButton?: boolean;
  confirmButtonColor?: string;
  cancelButtonColor?: string;
  confirmButtonText?: string;
  background?: string;
  color?: string;
}

interface SwalResult {
  isConfirmed: boolean;
}

interface SwalStatic {
  fire(options: SwalOptions): Promise<SwalResult>;
  fire(icon: string, title: string, text: string): Promise<SwalResult>;
}

declare const Swal: SwalStatic;
