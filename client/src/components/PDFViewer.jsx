import React from 'react';
import { Document, Page } from 'react-pdf';


/*
This component is currently not in use.
Its purpose is to be able to view an uploaded PDF file
*/

class PDFViewer extends React.Component {
  state = {
    numPages: null,
    pageNumber: 1,
  }

  onDocumentLoadSuccess = ({ numPages }) => {
    this.setState({ numPages });
  }

  render() {
    const { pageNumber, numPages } = this.state;
    const { pdfData } = this.props;

    return (
      <div>
        {pdfData && (
          <Document file={pdfData} onLoadSuccess={this.onDocumentLoadSuccess}>
            <Page pageNumber={pageNumber} />
          </Document>
        )}

        {pdfData && (
          <p>Page {pageNumber} of {numPages}</p>
        )}
      </div>
    );
  }
}

export default PDFViewer;
