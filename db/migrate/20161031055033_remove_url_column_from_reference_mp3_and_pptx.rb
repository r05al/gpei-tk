class RemoveUrlColumnFromReferenceMp3AndPptx < ActiveRecord::Migration
  def change
    remove_column :reference_mp3s, :url, :string
    remove_column :reference_pptxes, :url, :string
  end
end
