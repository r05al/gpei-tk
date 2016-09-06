class ReferenceLink < ActiveRecord::Base
  belongs_to :reference_linkable, :polymorphic => true
  belongs_to :author, class_name: 'User', foreign_key: 'author_id'

  has_attached_file :document,
                    :path => 'reference_links/:language/:filename',
                    :styles => { :thumb => ["200x200>", :png] }
  validates_attachment :document, content_type: { content_type: "application/pdf" }

  Paperclip.interpolates :language do |attachment, style|
    attachment.instance.language
  end
end