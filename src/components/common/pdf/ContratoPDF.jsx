import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { UseEditorGlobalContext } from "../../context/EditorGlobal";
import DOMPurify from 'dompurify';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666666',
  },
  section: {
    margin: '8 0',
  },
  text: {
    fontSize: 11,
    marginBottom: 8,
    lineHeight: 1.4,
    textAlign: 'justify',
  },
  clauseTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'left',
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#999999',
    borderStyle: 'dashed',
    marginVertical: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#666666',
    fontSize: 9,
    borderTopWidth: 0.5,
    borderTopColor: '#CCCCCC',
    paddingTop: 10,
  }
});

const convertHtmlToText = (html) => {
  // Si html es undefined o null, devolver un array vacío
  if (!html) return [];
  
  try {
    // First sanitize the HTML
    const sanitizedHtml = DOMPurify.sanitize(html);
    
    // Create a temporary div to handle HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitizedHtml;
    
    // Process the HTML structure
    const processNode = (node) => {
      let result = [];
      
      // Handle different node types
      switch (node.nodeType) {
        case Node.TEXT_NODE:
          // Clean and add text content
          const text = node.textContent.trim();
          if (text) result.push({ type: 'text', content: text });
          break;
          
        case Node.ELEMENT_NODE:
          // Handle specific elements
          switch (node.tagName.toLowerCase()) {
            case 'p':
              if (node.style && node.style.textAlign === 'center' && node.textContent.includes('----')) {
                result.push({ type: 'separator' });
              } else {
                const children = Array.from(node.childNodes).map(processNode).flat();
                result.push({ type: 'paragraph', children });
              }
              break;
              
            case 'strong':
              if (node.querySelector('u')) {
                // This is a clause title
                result.push({ 
                  type: 'clauseTitle', 
                  content: node.textContent.trim() 
                });
              } else {
                result.push({ 
                  type: 'bold', 
                  content: node.textContent.trim() 
                });
              }
              break;
              
            default:
              // Process child nodes recursively
              const children = Array.from(node.childNodes).map(processNode).flat();
              result = result.concat(children);
          }
          break;
      }
      
      return result;
    };
    
    // Process the entire document
    const processed = Array.from(tempDiv.childNodes).map(processNode).flat();
    return processed || [];
  } catch (error) {
    console.error("Error converting HTML to text:", error);
    return [{ type: 'text', content: 'Error al procesar el contenido del contrato' }];
  }
};

const ContratoPDF = ({ contrato, editorContent }) => {
  const { parrafo } = UseEditorGlobalContext() || {};
  
  if (!contrato) return null;

  // Get contract text from either the editor content, context, or contract object
  const contractText = editorContent || parrafo || contrato.pdfContratoTexto || '';
  
  // Convert HTML to structured content
  let content = [];
  try {
    content = convertHtmlToText(contractText);
    // Asegurarse de que content sea un array
    if (!Array.isArray(content)) {
      console.warn("content no es un array, usando valor por defecto");
      content = [{ type: 'text', content: 'El contenido del contrato no pudo ser procesado correctamente' }];
    }
  } catch (error) {
    console.error("Error in ContratoPDF:", error);
    content = [{ type: 'text', content: 'Error al procesar el documento' }];
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Contrato de Locación</Text>
          <Text style={styles.subtitle}>
            {contrato.nombreContrato || 'Contrato de Alquiler'}
          </Text>
        </View>

        <View style={styles.section}>
          {content.map((item, index) => {
            switch (item.type) {
              case 'clauseTitle':
                return (
                  <Text key={index} style={styles.clauseTitle}>
                    {item.content}
                  </Text>
                );
                
              case 'separator':
                return <View key={index} style={styles.separator} />;
                
              case 'paragraph':
                return (
                  <Text key={index} style={styles.text}>
                    {Array.isArray(item.children) 
                      ? item.children.map((child, childIndex) => 
                          child.type === 'text' ? child.content : ''
                        ).join(' ')
                      : ''}
                  </Text>
                );
                
              case 'text':
                return (
                  <Text key={index} style={styles.text}>
                    {item.content}
                  </Text>
                );
                
              default:
                return null;
            }
          })}
        </View>

        <View style={styles.footer}>
          <Text>
            Documento generado el {new Date().toLocaleDateString('es-AR')} • CRM Inmobiliario
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default ContratoPDF;
