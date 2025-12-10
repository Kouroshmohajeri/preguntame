declare module "jspdf" {
  interface jsPDF {
    internal: {
      getNumberOfPages: () => number;
      pageSize: {
        width: number;
        height: number;
        getWidth: () => number;
        getHeight: () => number;
      };
      pages: any[];
    };
  }
}
